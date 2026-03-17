import { useI18n } from '../i18n/useI18n';
import { useResponsiveLayout } from '../lib/responsive';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, t } = useI18n();
  const { isMobile } = useResponsiveLayout();
  const useCompactLayout = compact || isMobile;

  return (
    <div
      style={{
        ...styles.wrapper,
        width: compact ? 'auto' : isMobile ? '100%' : 'auto'
      }}
    >
      <span style={styles.icon} aria-hidden="true">🌐</span>
      {!useCompactLayout && <span style={styles.label}>{t('common.language')}</span>}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          ...styles.select,
          minWidth: compact ? 76 : useCompactLayout ? 0 : 88,
          width: compact ? 'auto' : isMobile ? '100%' : 'auto'
        }}
        aria-label={t('common.language')}
      >
        <option value="he">{t('common.hebrew')}</option>
        <option value="en">{t('common.english')}</option>
      </select>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'inline-flex',
    gap: 6,
    alignItems: 'center',
    fontSize: 13,
    color: '#0f172a',
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid rgba(148, 163, 184, 0.3)',
    background: 'linear-gradient(135deg, rgba(226, 232, 240, 0.55), rgba(203, 213, 225, 0.45))',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
    whiteSpace: 'nowrap'
  },
  icon: {
    fontSize: 14,
    lineHeight: 1
  },
  label: {
    fontWeight: 700
  },
  select: {
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '5px 8px',
    background: 'rgba(255, 255, 255, 0.96)',
    color: '#0f172a',
    minWidth: 88,
    fontWeight: 600
  }
};
