import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon: React.ReactNode;
  /** Optional action (e.g. a Retry button) rendered under the message. */
  action?: React.ReactNode;
}

export default function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 mb-4 text-gray-600">{icon}</div>
      <h3 className="text-xl font-medium text-gray-200 mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}