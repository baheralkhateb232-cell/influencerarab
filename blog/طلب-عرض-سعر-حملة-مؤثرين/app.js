/**
 * Influencer Platform VIP / RFP article
 * No third-party JavaScript, tracking SDK, hidden uploads, or storage.
 * RFP content stays entirely in the visitor's browser unless they copy/export it.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const nav = $('siteNav');
  const menuToggle = $('menuToggle');
  const progress = $('readProgress');

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(opened));
      menuToggle.setAttribute('aria-label', opened ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل');
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });
  }

  // Optional, non-sensitive measurement: works only if an analytics dataLayer is installed by the site owner.
  document.querySelectorAll('a[data-track]').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: 'vip_rfp_cta_click', cta_location: anchor.dataset.track });
      }
    });
  });

  /* Weighted evaluation matrix: 5 criteria, each bid scored from 1 to 5. */
  const criteria = [
    { name: 'ملاءمة الجمهور وتدقيق المؤثرين', weight: 25, scores: [3, 5, 4] },
    { name: 'دقة المخرجات والتنفيذ', weight: 20, scores: [2, 4, 5] },
    { name: 'التقارير وقابلية قياس النتائج', weight: 25, scores: [2, 5, 4] },
    { name: 'وضوح حقوق الاستخدام', weight: 15, scores: [2, 4, 3] },
    { name: 'قيمة السعر مقابل النطاق', weight: 15, scores: [5, 3, 4] }
  ];
  const totalEls = [$('totalA'), $('totalB'), $('totalC')];
  const scorerows = $('scoreRows');
  const scoreRecommendation = $('scoreRecommendation');

  const scoreLabel = (score) => ({ 1: '1 - ضعيف', 2: '2 - محدود', 3: '3 - مقبول', 4: '4 - جيد', 5: '5 - ممتاز' }[score]);
  function makeScores() {
    if (!scorerows) return;
    scorerows.replaceChildren();
    criteria.forEach((criterion, i) => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = criterion.name;
      tr.appendChild(th);
      const weightCell = document.createElement('td');
      weightCell.textContent = `${criterion.weight}%`;
      tr.appendChild(weightCell);
      criterion.scores.forEach((score, bidIndex) => {
        const td = document.createElement('td');
        const select = document.createElement('select');
        select.setAttribute('aria-label', `${criterion.name} — عرض ${'أبج'[bidIndex]}`);
        select.dataset.criterion = String(i);
        select.dataset.bid = String(bidIndex);
        for (let value = 1; value <= 5; value++) {
          const option = document.createElement('option');
          option.value = String(value);
          option.textContent = scoreLabel(value);
          option.selected = value === score;
          select.appendChild(option);
        }
        select.addEventListener('change', updateScores);
        td.appendChild(select);
        tr.appendChild(td);
      });
      scorerows.appendChild(tr);
    });
    updateScores();
  }
  function updateScores() {
    if (!scorerows) return;
    const totals = [0, 0, 0];
    scorerows.querySelectorAll('select').forEach((select) => {
      const i = Number(select.dataset.criterion);
      const j = Number(select.dataset.bid);
      const value = Number(select.value);
      totals[j] += (value / 5) * criteria[i].weight;
    });
    totals.forEach((value, index) => {
      if (totalEls[index]) totalEls[index].textContent = `${value.toFixed(0)}/100`;
    });
    if (scoreRecommendation) {
      const max = Math.max(...totals);
      const names = totals.map((value, index) => Math.abs(value - max) < 0.00001 ? 'أبج'[index] : null).filter(Boolean);
      scoreRecommendation.textContent = names.length === 1
        ? `أعلى نتيجة وفق تقييمك: العرض ${names[0]} (${max.toFixed(0)} من 100). تحقق من المخرجات والعقد قبل الاختيار.`
        : `النتائج الأعلى متعادلة: ${names.map(x => `عرض ${x}`).join(' و ')} (${max.toFixed(0)} من 100).`;
    }
  }
  if (scorerows) {
    makeScores();
    $('resetScores')?.addEventListener('click', makeScores);
  }

  /* Client-side Request for Proposal generator. */
  const form = $('rfpForm');
  const market = $('market');
  const currency = $('currency');
  const result = $('rfpResult');
  const empty = $('emptyPreview');
  const status = $('rfpStatus');
  const copyBtn = $('copyRfp');
  const downloadBtn = $('downloadRfp');
  const printBtn = $('printRfp');
  let generatedRfp = '';
  let currencyWasSelectedByUser = false;

  if (currency) currency.addEventListener('change', () => { currencyWasSelectedByUser = true; });
  if (market && currency) {
    market.addEventListener('change', () => {
      const map = {
        'المملكة العربية السعودية': 'SAR', 'الإمارات العربية المتحدة': 'AED',
        'الكويت': 'KWD', 'قطر': 'QAR', 'سلطنة عُمان': 'OMR',
        'البحرين': 'BHD', 'مصر': 'EGP'
      };
      if (!currencyWasSelectedByUser && map[market.value]) currency.value = map[market.value];
    });
  }

  const value = (id, fallback = 'لم يُحدد') => {
    const text = String($(id)?.value ?? '').trim();
    return text || fallback;
  };
  const bullets = (items) => items.map(item => `• ${item}`).join('\n');
  const fullDate = () => new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  function makeRfpText() {
    const platforms = Array.from(form.querySelectorAll('input[name="platform"]:checked'), checkbox => checkbox.value);
    const deliverables = value('deliverables');
    const requestedBudget = `${value('budget')} ${value('currency', 'SAR')}`;
    return [
      'طلب عرض سعر حملة تسويق عبر المؤثرين (RFP)',
      '================================================',
      `تاريخ إعداد الطلب: ${fullDate()}`,
      'حالة المستند: مسودة أولية — تخضع لاعتماد الشركة قبل الإرسال',
      '',
      '1. تعريف المشروع',
      `الشركة / العلامة التجارية: ${value('brandName')}`,
      `المجال: ${value('industry')}`,
      `السوق المستهدف: ${value('market')}`,
      `المدن: ${value('city')}`,
      `وصف الجمهور: ${value('audience')}`,
      '',
      '2. الهدف ونطاق التنفيذ',
      `الهدف التجاري: ${value('goal')}`,
      `المنصات المطلوبة: ${platforms.length ? platforms.join('، ') : 'تُقترح بناء على الهدف'}`,
      `عدد المؤثرين: ${value('creators', 'يُقترح من الوكالة')}`,
      `المخرجات المطلوبة: ${deliverables}`,
      `موعد الإطلاق: ${value('timeline', 'يُتفق عليه')}`,
      `الميزانية المتوقعة: ${requestedBudget}`,
      '',
      '3. الحقوق والأداء',
      `حقوق الاستخدام المطلوبة: ${value('usage')}`,
      `مؤشر النجاح الأساسي: ${value('measurement')}`,
      `اشتراطات / ملاحظات الشركة: ${value('notes', 'لا توجد ملاحظات إضافية في هذه المرحلة')}`,
      '',
      '4. المطلوب من الوكالة في عرضها',
      bullets([
        'تصور استراتيجي مختصر يشرح اختيار المؤثرين والمنصات وفق الجمهور والهدف.',
        'عدد المؤثرين المقترح وفئاتهم ومعايير ملاءمة الجمهور وخطة البدائل.',
        'قائمة بالمخرجات لكل مؤثر: النوع، العدد، المدة، المنصة، وتاريخ النشر.',
        'تفصيل مالي مستقل: أتعاب المؤثرين، رسوم الإدارة، الإنتاج، الحقوق، القياس.',
        'التمييز الصريح بين البنود المشمولة والمستثناة: الضرائب، الإعلانات الممولة، العينات، السفر وغيرها.',
        'حدود حقوق إعادة النشر والاستخدام المدفوع والحصرية، ومُددها الجغرافية والزمنية.',
        'مسار اعتماد المحتوى وعدد التعديلات وشروط التأخير والاستبدال والإلغاء.',
        'خطة قياس مناسبة للهدف، وتوقيت التقرير، ومصادر البيانات وحدود الإسناد.',
        'متطلبات الامتثال والإفصاح ذات الصلة، وتوزيع مسؤوليات التحقق.',
        'الجدول الزمني والمراحل ونقاط الموافقة وشروط الدفع وصلاحية العرض.'
      ]),
      '',
      '5. المطلوب لمرحلة المقارنة',
      'يرجى تقديم السعر مع تفصيل نطاق العمل، وذكر أي افتراضات أو بدائل تؤثر في المبلغ النهائي.',
      '',
      '------------------------------------------------',
      'ملاحظة: أُنشئت المسودة محليًا باستخدام أداة Influencer Platform VIP؛ لم تُرسل آليًا إلى أي جهة.',
      'https://influencer-platform.vip/blog/طلب-عرض-سعر-حملة-مؤثرين/'
    ].join('\n');
  }

  if (form && result) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      generatedRfp = makeRfpText();
      result.textContent = generatedRfp; // No HTML injection from user fields.
      result.hidden = false;
      if (empty) empty.hidden = true;
      [copyBtn, downloadBtn, printBtn].forEach(btn => { if (btn) btn.disabled = false; });
      if (status) status.textContent = 'تم إعداد الطلب. راجع النص، ثم انسخه أو نزّله أو اطبعه.';
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: 'vip_rfp_generated' }); // No PII / no form field values.
      }
      if (window.matchMedia('(max-width: 920px)').matches) {
        $('outputPreview')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!generatedRfp) return;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(generatedRfp);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = generatedRfp;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const copied = document.execCommand('copy');
          textarea.remove();
          if (!copied) throw new Error('Clipboard unavailable');
        }
        if (status) status.textContent = 'تم نسخ المستند. يمكنك الآن لصقه في بريدك أو ملف طلب العروض.';
      } catch (_) {
        if (status) status.textContent = 'تعذر النسخ التلقائي. حدّد النص في المعاينة وانسخه يدويًا.';
      }
    });
  }
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!generatedRfp) return;
      const blob = new Blob(['\ufeff', generatedRfp], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'نموذج-طلب-عرض-سعر-حملة-مؤثرين-RFP.txt';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (status) status.textContent = 'تم تجهيز ملف TXT لتنزيله على جهازك.';
    });
  }
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      if (!generatedRfp) return;
      window.print();
    });
  }
})();
