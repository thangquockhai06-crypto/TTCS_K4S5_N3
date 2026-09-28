import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Layers, ShieldCheck, TrendingUp } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import logoUrl from '../assets/logo.svg';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  return (
    <div className={styles.loginSplitLayout}>
      {/* Cột trái: Giới thiệu sản phẩm SaaS & Biểu đồ Doanh thu */}
      <section className={styles.showcasePanel} aria-label="Giới thiệu nền tảng NexusCRM">
        <div className={styles.showcasePanel__meshGlow} aria-hidden="true" />

        <header className={styles.showcasePanel__brand}>
          <img src={logoUrl} alt="NexusCRM" className={styles.showcasePanel__logo} />
          <div>
            <span className={styles.showcasePanel__brandName}>NexusCRM</span>
            <span className={styles.showcasePanel__edition}>PHIÊN BẢN DOANH NGHIỆP · 2026</span>
          </div>
        </header>

        <div className={styles.showcasePanel__hero}>
          <motion.h2
            className={styles.showcasePanel__headline}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Nền tảng Quản trị Quan hệ Khách hàng & Tăng trưởng Doanh thu.
          </motion.h2>
          <p className={styles.showcasePanel__subheadline}>
            Được tin dùng bởi các doanh nghiệp công nghệ hàng đầu để hợp nhất dự báo phễu bán hàng,
            chấm điểm sức khỏe khách hàng và tự động hóa quy trình hợp đồng.
          </p>

          {/* Thẻ minh họa Glassmorphism */}
          <motion.div
            className={styles.previewIllustration}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className={styles.previewCard}>
              <div className={styles.previewCard__header}>
                <span className={styles.previewCard__tag}>
                  <TrendingUp size={14} /> Dự báo Doanh thu Định kỳ (ARR)
                </span>
                <span className={styles.previewCard__badge}>+28.4% so với cùng kỳ</span>
              </div>
              <div className={styles.previewCard__metricRow}>
                <strong className="tabular-nums">$4,860,000</strong>
                <span>Độ phủ Phễu Quý 3 · Độ tin cậy 94%</span>
              </div>
              <div className={styles.previewCard__bars}>
                {[42, 56, 48, 68, 76, 85, 96].map((height, idx) => (
                  <div key={`bar-${idx}`} className={styles.previewCard__barCol}>
                    <div
                      className={styles.previewCard__barFill}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.previewFloatingRow}>
              <div className={styles.previewMiniPill}>
                <CheckCircle2 size={15} className={styles.previewMiniPill__iconSuccess} />
                <div>
                  <strong>Stripe Japan · Đã ký hợp đồng</strong>
                  <span>$420,000 Giá trị Hợp đồng Năm</span>
                </div>
                <ArrowUpRight size={15} />
              </div>

              <div className={styles.previewMiniPill}>
                <ShieldCheck size={15} className={styles.previewMiniPill__iconPrimary} />
                <div>
                  <strong>Tự động làm mới JWT (S1-02)</strong>
                  <span>Bảo vệ phiên làm việc không gián đoạn</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <footer className={styles.showcasePanel__footer}>
          <div className={styles.showcasePanel__trustItem}>
            <Layers size={15} />
            <span>Đạt chuẩn Bảo mật Quốc tế SOC2 Type II & ISO 27001</span>
          </div>
          <span>Cam kết Uptime 99.99%</span>
        </footer>
      </section>

      {/* Cột phải: Form Đăng nhập */}
      <main className={styles.formPanel}>
        <LoginForm />
      </main>
    </div>
  );
};
