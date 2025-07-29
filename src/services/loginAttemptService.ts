// Login attempt tracking service
interface LoginAttempt {
  id: string;
  email: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export class LoginAttemptService {
  private static readonly STORAGE_KEY = 'login_attempts';
  private static readonly NOTIFICATIONS_KEY = 'admin_notifications';

  static getLoginAttempts(): LoginAttempt[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static addLoginAttempt(email: string, ipAddress: string = '192.168.1.100'): void {
    const attempts = this.getLoginAttempts();
    const newAttempt: LoginAttempt = {
      id: Date.now().toString(),
      email,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent: navigator.userAgent || 'Unknown',
      status: 'pending'
    };

    attempts.unshift(newAttempt);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attempts));
    
    // Add admin notification
    this.addAdminNotification(newAttempt);
    
    console.log('New login attempt recorded:', newAttempt);
  }

  static updateAttemptStatus(attemptId: string, status: 'approved' | 'rejected', adminNotes?: string): void {
    const attempts = this.getLoginAttempts();
    const updated = attempts.map(attempt => 
      attempt.id === attemptId 
        ? { ...attempt, status, adminNotes, reviewedAt: new Date().toISOString() }
        : attempt
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  private static addAdminNotification(attempt: LoginAttempt): void {
    const notifications = JSON.parse(localStorage.getItem(this.NOTIFICATIONS_KEY) || '[]');
    const notification = {
      id: `login_${attempt.id}`,
      type: 'login_attempt',
      title: 'New Login Request',
      message: `User ${attempt.email} requesting access`,
      timestamp: attempt.timestamp,
      data: attempt,
      read: false
    };
    
    notifications.unshift(notification);
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    
    // Trigger notification event
    window.dispatchEvent(new CustomEvent('newLoginAttempt', { detail: notification }));
  }

  static getPendingAttempts(): LoginAttempt[] {
    return this.getLoginAttempts().filter(attempt => attempt.status === 'pending');
  }

  static clearOldAttempts(daysOld: number = 30): void {
    const attempts = this.getLoginAttempts();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const filtered = attempts.filter(attempt => 
      new Date(attempt.timestamp) > cutoffDate
    );
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}