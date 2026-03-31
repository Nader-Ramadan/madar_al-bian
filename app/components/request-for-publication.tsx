import styles from '../page.module.css';

export default function RequestForPublication() {
  const publicationProcess = [
    {
      number: '1',
      title: 'تقديم البحث',
      description: 'تقديم الطلب عبر النموذج الإلكتروني',
    },
    {
      number: '2',
      title: 'المراجعة الأولية',
      description: 'فحص البحث من قبل فريق التحرير',
    },
    {
      number: '3',
      title: 'التحكيم العلمي',
      description: 'تقييم من قبل خبراء متخصصين',
    },
    {
      number: '4',
      title: 'النشر',
      description: 'نشر البحث في المجلات',
    },
  ];

  return (
    <section className={styles.publicationSection}>
      {/* Hero Section with Background Image */}
      <div className={styles.publicationHero}>
        <div className={styles.publicationHeroOverlay}>
          <h1 className={styles.publicationTitle}>طلب نشر دراسة</h1>
          <p className={styles.publicationHeroSubtitle}>
            ترحب المؤسسة بنشر الدراسات والأبحاث العلمية المتميزة، ويُرجى من السادة الباحثين تعبئة النموذج أدناه واستكمال جميع البيانات المطلوبة بدقة، لضمان سرعة وكفاءة دراسة الطلب
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className={styles.publicationFormWrapper}>
        <form className={styles.publicationForm}>
          {/* Researcher Information */}
          <div className={styles.formSection}>
            <h2>معلومات الباحث</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>الاسم بالكامل*</label>
                <input type="text" placeholder="ادخل الاسم بالكامل" required />
              </div>
              <div className={styles.formGroup}>
                <label>البريد الإلكتروني *</label>
                <input type="email" placeholder="ادخل البريد الإلكتروني" required />
              </div>
              <div className={styles.formGroup}>
                <label>رقم الهاتف *</label>
                <input type="tel" placeholder="ادخل رقم الهاتف" required />
              </div>
              <div className={styles.formGroup}>
                <label>البلد *</label>
                <input type="text" placeholder="البلد" required />
              </div>
            </div>
          </div>

          {/* Research Information */}
          <div className={styles.formSection}>
            <h2>معلومات البحث</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>عنوان البحث *</label>
                <input type="text" placeholder="ادخل عنوان البحث" required />
              </div>
              <div className={styles.formGroup}>
                <label>المجلة المستهدفة *</label>
                <select required>
                  <option value="">اختر المجلة</option>
                  <option value="journal1">المجلة العلمية 1</option>
                  <option value="journal2">المجلة العلمية 2</option>
                </select>
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label>ملخص البحث *</label>
                <textarea placeholder="ادخل الملخصات" rows={4} required></textarea>
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label>الكلمات المفتاحية *</label>
                <input type="text" placeholder="ادخل الكلمات" required />
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label>ملف ورقة البحث *</label>
                <div className={styles.fileUpload}>
                  <div className={styles.fileUploadIcon}>📎</div>
                  <p>رفع ملف ات هنا أو اضغط للتصفح</p>
                  <small>PDF, DOC, DOCX (الحد الأقصى: 10 ميجابايت)</small>
                  <input type="file" accept=".pdf,.doc,.docx" required hidden />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button className={styles.publicationSubmitButton} type="submit">
            ارسال الطلب
          </button>
        </form>
      </div>

      {/* Publication Process Section */}
      <div className={styles.publicationProcessSection}>
        <h2>مراحل عملية النشر</h2>
        <div className={styles.publicationProcessGrid}>
          {publicationProcess.map((step, index) => (
            <div key={index} className={styles.publicationProcessCard}>
              <div className={styles.processStepNumber}>{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
