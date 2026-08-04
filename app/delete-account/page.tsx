import React from 'react';

export default function DeleteAccountPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Account Deletion Request</h1>
      <p>At Q Posts Saver, we value your privacy. If you wish to delete your account and all associated data, please follow the steps below:</p>
      
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3>How to delete your account:</h3>
        <p>Send an email to: <strong>syedasameen148@gmail.com</strong></p>
        <p>Subject: <strong>Account Deletion Request - Q Posts Saver</strong></p>
        <p>Please include the <strong>email address</strong> associated with the account you wish to delete.</p>
      </div>

      <h3 style={{ marginTop: '30px' }}>What happens when I delete my account?</h3>
      <ul>
        <li>All your saved posts and collections will be permanently removed from our servers.</li>
        <li>Your profile information (display name and email) will be deleted.</li>
        <li>This action is permanent and cannot be undone.</li>
      </ul>
      
      <p style={{ color: '#64748b', fontSize: '14px', marginTop: '40px' }}>
        Note: Requests are typically processed within 48-72 hours.
      </p>
    </div>
  );
}
