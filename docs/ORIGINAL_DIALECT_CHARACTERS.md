# قُل, وضع ملفات الشخصيات الأصلية

## الحالة
- 22 دولة، شخصية رجل وامرأة، أي 44 شخصية.
- سلمان (السعودية، رجل): يعمل بمحرك الصورة الأصلية ذي 42 طبقة، ويحافظ على ملامحه المعتمدة.
- بقية الشخصيات (43): تمت استعادة الصور الأصلية، وصُنعت لها حزم إعداد متعددة الطبقات قابلة للتحرير.

## المنجز
1. جمع الصور الأصلية الـ44 والتحقق من توافرها جميعًا.
2. اكتشاف مواقع الوجه والعينين والفم لكل شخصية.
3. إنتاج 43 حزمة إعداد للصورة الأصلية، و43 ملفًا بتنسيق OpenRaster، يمكن فتحه في GIMP أو Krita وتحويله إلى PSD.
4. توحيد الحركة التفاعلية في محرك WebGL لجميع الدول، مع إبقاء سلمان الأصلي دون تغيير.
5. إضافة برنامج استيراد الحزم: scripts/install-qul-avatar-rigs.py.

## ما لم يُنجز بعد
- إعادة بناء تفاصيل الجسم المخفية خلف الرأس والذراعين، واستخراج أقنعة القطع النظيفة.
- رسم الجفون وأشكال الفم الصوتية الدقيقة، ومواءمة تعبيرات الوجه مع صوت الكلام.
- إعداد ملفات Live2D Cubism وتوثيق الجودة لكل شخصية.
- نقل الصور الثنائية الأبعاد الأصلية والحزم نفسها إلى مستودع GitHub وموقع Vercel.

حزم OpenRaster الحالية **مسودات فنية أولية وليست ملفات Live2D مكتملة**.
لا تستبدل الرسم المعتمد في الموقع تلقائيًا بمسودات التحريك قبل مراجعتها.

## حزم التسليم
- QUL_44_original_character_sources.zip، أصول الصور المعتمدة.
- QUL_43_rig_preparation.zip، الصور المصغرة وطبقات تحاذي العينين والفم.
- QUL_43_openraster_editable.zip، 43 ملف ORA متعدد الطبقات.

## ضوابط النشر
التصميم الأصلي للشخصية هو المرجع الوحيد. لا تنشر نموذجًا بديلًا على أنه الأصل؛ مرّر كل شخصية عبر الموافقة البصرية قبل التشغيل الحي.


## Runtime integration, November 2026
- components/OriginalPortraitAvatar.tsx checks each original portrait at /avatars/original-rigs/{country}/{gender}/source.webp. When present, the original portrait is used for conservative, identity-preserving breathing and selection motion. If absent, the current 3D tutor remains active.
- components/Interactive3DTutor.tsx now uses this loader for the 43 characters other than Salman. Salman's original 42-layer rig remains unchanged.
- QUL_original_portraits_for_GitHub.zip contains 43 source.webp images, 43 identity records, and an independently SHA-256 verified manifest. It is a GitHub-ready archive, not a Live2D rig.
- .github/workflows/install-qul-original-portraits.yml installs the archive when it is uploaded to the root of main, checks every expected portrait's checksum and ZIP path, then commits the portraits so Vercel can deploy them.
- Do not claim portrait installation until the GitHub Actions workflow has succeeded and the images are returned by the live site. The GitHub connector's text-only create_file API cannot directly upload the prepared local binary portraits. Without the archive upload, the website safely keeps its 3D fallbacks.
- The animation available from a whole original photo is limited to modest full-body breathing, tilt and selection. True synchronized eyelid, lip, head, hands and arms animation still requires manually reviewed multi-layer source artwork, as with Salman.
