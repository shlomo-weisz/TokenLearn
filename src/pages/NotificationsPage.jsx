import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApp } from '../context/useApp';
import { useI18n } from '../i18n/useI18n';
import { formatNotificationDate, renderNotificationPreview } from '../lib/notificationInbox';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const isHe = language === 'he';
  const { getNotifications, markNotificationsRead, unreadNotificationCount, loading } = useApp();

  const [items, setItems] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadNotifications = async (onlyUnread = unreadOnly) => {
    setPageLoading(true);
    const result = await getNotifications({
      limit: 100,
      unreadOnly: onlyUnread
    });
    setPageLoading(false);

    if (!result.success) {
      return;
    }

    setItems(result.data || []);
  };

  useEffect(() => {
    loadNotifications(unreadOnly);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  const handleMarkRead = async (notificationId) => {
    const result = await markNotificationsRead([notificationId]);
    if (!result.success) {
      return;
    }

    setItems((prev) => unreadOnly
      ? prev.filter((item) => item.id !== notificationId)
      : prev.map((item) => (
        item.id === notificationId ? { ...item, isRead: true } : item
      )));
  };

  const handleMarkAllRead = async () => {
    const result = await markNotificationsRead();
    if (!result.success) {
      return;
    }

    setItems((prev) => unreadOnly ? [] : prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleOpen = async (item) => {
    if (!item.isRead) {
      await handleMarkRead(item.id);
    }

    if (item.actionPath) {
      navigate(item.actionPath);
    }
  };

  return (
    <div style={styles.page}>
      {(loading || pageLoading) && <LoadingSpinner fullScreen />}

      <section style={styles.hero}>
        <div>
          <h1 style={styles.title}>{isHe ? 'תיבת הודעות' : 'Message Inbox'}</h1>
          <p style={styles.subtitle}>
            {isHe
              ? `כאן מופיעים אישורים, ביטולים, תזכורות והודעות תיאום. ${unreadNotificationCount > 0 ? `יש ${unreadNotificationCount} הודעות שלא נקראו.` : 'אין כרגע הודעות שלא נקראו.'}`
              : `Approvals, cancellations, reminders, and coordination messages appear here. ${unreadNotificationCount > 0 ? `You have ${unreadNotificationCount} unread messages.` : 'You have no unread messages right now.'}`}
          </p>
        </div>

        <div style={styles.toolbar}>
          <Button variant={unreadOnly ? 'secondary' : 'primary'} onClick={() => setUnreadOnly(false)}>
            {isHe ? 'הכול' : 'All'}
          </Button>
          <Button variant={unreadOnly ? 'primary' : 'secondary'} onClick={() => setUnreadOnly(true)}>
            {isHe ? 'רק לא נקראו' : 'Unread Only'}
          </Button>
          <Button variant="secondary" onClick={handleMarkAllRead} disabled={unreadNotificationCount === 0}>
            {isHe ? 'סימון הכול כנקרא' : 'Mark All Read'}
          </Button>
        </div>
      </section>

      <section style={styles.list}>
        {items.length === 0 ? (
          <Card style={styles.emptyCard} hoverable={false}>
            <div style={styles.emptyIcon}>✉️</div>
            <div style={styles.emptyTitle}>{isHe ? 'אין הודעות להצגה' : 'No messages to show'}</div>
            <div style={styles.emptyText}>
              {unreadOnly
                ? (isHe ? 'כל ההודעות כבר נקראו.' : 'All messages are already read.')
                : (isHe ? 'כאשר יהיו עדכונים במערכת, הם יופיעו כאן.' : 'When new updates arrive, they will appear here.')}
            </div>
          </Card>
        ) : (
          items.map((item) => {
            const preview = renderNotificationPreview(item, language);

            return (
              <Card
                key={item.id}
                style={{
                  ...styles.card,
                  ...(item.isRead ? styles.cardRead : styles.cardUnread)
                }}
                hoverable={false}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.headerLeft}>
                    <div style={styles.cardTitle}>{preview.title}</div>
                    {!item.isRead && <span style={styles.unreadPill}>{isHe ? 'חדש' : 'New'}</span>}
                  </div>
                  <div style={styles.timeLabel}>{formatNotificationDate(item.createdAt || item.scheduledAt, language)}</div>
                </div>

                <div style={styles.cardBody}>{preview.body}</div>

                <div style={styles.cardFooter}>
                  <div style={styles.metaRow}>
                    {item.courseName && <span style={styles.coursePill}>{item.courseName}</span>}
                    {item.counterpartName && <span style={styles.counterpartLabel}>{item.counterpartName}</span>}
                  </div>

                  <div style={styles.actions}>
                    {!item.isRead && (
                      <Button variant="secondary" onClick={() => handleMarkRead(item.id)}>
                        {isHe ? 'סימון כנקרא' : 'Mark Read'}
                      </Button>
                    )}
                    {item.actionPath && (
                      <Button onClick={() => handleOpen(item)}>
                        {isHe ? 'פתיחה' : 'Open'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    display: 'grid',
    gap: 18,
    padding: 18
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    flexWrap: 'wrap',
    padding: 24,
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(14,165,233,0.10), rgba(251,191,36,0.10), rgba(255,255,255,0.88))',
    border: '1px solid rgba(14, 165, 233, 0.18)'
  },
  title: {
    margin: 0,
    fontSize: 30,
    color: '#0f172a'
  },
  subtitle: {
    margin: '10px 0 0 0',
    color: '#475569',
    lineHeight: 1.7,
    maxWidth: 760
  },
  toolbar: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  list: {
    display: 'grid',
    gap: 14
  },
  card: {
    maxWidth: '100%',
    display: 'grid',
    gap: 16
  },
  cardUnread: {
    borderColor: 'rgba(14, 165, 233, 0.35)',
    boxShadow: '0 18px 40px rgba(14, 165, 233, 0.10)'
  },
  cardRead: {
    opacity: 0.94
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#0f172a'
  },
  unreadPill: {
    padding: '5px 10px',
    borderRadius: 999,
    background: '#dbeafe',
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: 800
  },
  timeLabel: {
    color: '#64748b',
    fontSize: 13
  },
  cardBody: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    color: '#334155'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  metaRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  coursePill: {
    padding: '6px 10px',
    borderRadius: 999,
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#334155',
    fontSize: 12,
    fontWeight: 700
  },
  counterpartLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: 600
  },
  actions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  emptyCard: {
    maxWidth: '100%',
    alignItems: 'center',
    textAlign: 'center',
    padding: 36,
    gap: 12
  },
  emptyIcon: {
    fontSize: 42
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#0f172a'
  },
  emptyText: {
    color: '#64748b',
    lineHeight: 1.7
  }
};
