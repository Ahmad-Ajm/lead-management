export function LoadingState({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="state-card">
      <div className="state-spinner" />
      <div>{text}</div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="error-box">
      <strong>Something went wrong.</strong>
      <div>{message}</div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="empty-box">{text}</div>;
}
