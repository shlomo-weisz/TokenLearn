import { useEffect, useState } from 'react';
import { useApp } from '../context/useApp';
import LoadingSpinner from '../components/LoadingSpinner';
import { useI18n } from '../i18n/useI18n';
import { isValidDate, parseFlexibleDate } from '../lib/dateTimeUtils';

export default function TokenHistoryPage() {
  const { language } = useI18n();
  const isHe = language === 'he';
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

  const formatDate = (value) => {
    const parsed = parseFlexibleDate(value);
    if (!isValidDate(parsed)) {
      return isHe ? 'לא זמין' : 'N/A';
    }
    return parsed.toLocaleString(isHe ? 'he-IL' : 'en-US');
  };

  const getTypeMeta = (type) => {
    switch (String(type || '').toLowerCase()) {
      case 'purchase':
        return { icon: '💳', label: isHe ? 'רכישת טוקנים' : 'Token purchase' };
      case 'bonus':
        return { icon: '🎁', label: isHe ? 'בונוס' : 'Bonus' };
      case 'transfer_in':
        return { icon: '⬇️', label: isHe ? 'העברה נכנסת' : 'Incoming transfer' };
      case 'transfer_out':
        return { icon: '⬆️', label: isHe ? 'העברה יוצאת' : 'Outgoing transfer' };
      case 'reservation':
        return { icon: '🔒', label: isHe ? 'שמירת טוקנים לשיעור' : 'Token reservation' };
      case 'refund':
        return { icon: '↩️', label: isHe ? 'החזר טוקנים' : 'Token refund' };
      case 'admin_adjust':
        return { icon: '🛠️', label: isHe ? 'התאמת מנהל' : 'Admin adjustment' };
      default:
        return { icon: '🪙', label: isHe ? 'תנועת טוקנים' : 'Token movement' };
    }
  };

  const localizeReason = (transaction) => {
    const type = String(transaction?.type || '').toLowerCase();
    const reason = String(transaction?.reason || '').trim();
    const normalizedReason = reason.toLowerCase();

    if (type === 'bonus' && (normalizedReason.includes('welcome bonus') || normalizedReason.includes('first 50'))) {
      return isHe ? 'בונוס הצטרפות: 50 טוקנים למשתמשים הראשונים' : 'Welcome bonus: 50 tokens for early users';
    }

    if (type === 'admin_adjust' && (normalizedReason === 'admin_adjustment' || normalizedReason === 'admin_adjust')) {
      return isHe ? 'עדכון ידני על ידי מנהל המערכת' : 'Manual adjustment by administrator';
    }

    if (!reason) {
      return isHe ? 'ללא פירוט נוסף' : 'No additional details';
    }

    if (isHe && !/[\u0590-\u05FF]/.test(reason)) {
      if (normalizedReason === 'token purchase') return 'רכישת טוקנים';
      if (normalizedReason === 'token transfer') return 'העברת טוקנים';
      if (normalizedReason === 'lesson_payment') return 'תשלום עבור שיעור';
      if (normalizedReason === 'refund due to request rejection') return 'החזר בעקבות דחיית בקשה';
      if (normalizedReason === 'refund due to request cancellation') return 'החזר בעקבות ביטול בקשה';
      if (normalizedReason === 'token reservation for lesson request') return 'שמירת טוקנים עבור בקשת שיעור';
      if (normalizedReason === 'welcome bonus - first 50 users') return 'בונוס הצטרפות למשתמשים הראשונים';
      return 'פירוט תנועה';
    }

    return reason;
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16, display: 'grid', gap: 16 }}>
      {loading && <LoadingSpinner fullScreen />}
      <h1 style={{ marginTop: 0 }}>{isHe ? 'היסטוריית טוקנים' : 'Token History'}</h1>

      {transactions.length === 0 ? (
        <div style={styles.empty}>{isHe ? 'אין תנועות טוקנים להצגה.' : 'No token transactions to display.'}</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {transactions.map((transaction) => (
            <div key={transaction.id} style={styles.card} dir={isHe ? 'rtl' : 'ltr'}>
              <div style={styles.row}>
                <div style={styles.titleWrap}>
                  <span style={styles.icon} aria-hidden="true">{getTypeMeta(transaction.type).icon}</span>
                  <strong>{getTypeMeta(transaction.type).label}</strong>
                </div>
                <span style={{ ...styles.amount, color: transaction.amount >= 0 ? '#065f46' : '#991b1b' }}>
                  {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}
                </span>
              </div>
              <div style={styles.subRow}>
                <span>{isHe ? 'פירוט' : 'Details'}: {localizeReason(transaction)}</span>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              {transaction.toUser && <div style={styles.subRow}>{isHe ? 'למשתמש' : 'To user'}: {transaction.toUser}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 14,
    background: 'white',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  titleWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 999,
    background: '#eff6ff',
    border: '1px solid #bfdbfe'
  },
  amount: {
    fontWeight: 700,
    direction: 'ltr',
    unicodeBidi: 'plaintext'
  },
  subRow: {
    marginTop: 6,
    color: '#475569',
    fontSize: 14
  },
  empty: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    color: '#475569'
  }
};
