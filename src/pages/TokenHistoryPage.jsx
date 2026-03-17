import { useEffect, useState } from 'react';
import TokenHistoryList from '../components/TokenHistoryList';
import { useApp } from '../context/useApp';
import LoadingSpinner from '../components/LoadingSpinner';
import { useI18n } from '../i18n/useI18n';
import { useResponsiveLayout } from '../lib/responsive';

export default function TokenHistoryPage() {
  const { language } = useI18n();
  const isHe = language === 'he';
  const { isMobile } = useResponsiveLayout();
  const { getTokenHistory, loading } = useApp();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const result = await getTokenHistory(20, 0);
      if (result.success && isMounted) {
        setTransactions(result.data.transactions || []);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? 12 : 16, display: 'grid', gap: 16 }}>
      {loading && <LoadingSpinner fullScreen />}
      <h1 style={{ marginTop: 0 }}>{isHe ? 'היסטוריית טוקנים' : 'Token History'}</h1>
      <TokenHistoryList transactions={transactions} />
    </div>
  );
}
