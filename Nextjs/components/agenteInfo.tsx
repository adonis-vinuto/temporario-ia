export default function AgenteInfo({
  icon,
  name,
  value,
}: {
  icon?: React.ReactNode;
  name: string;
  value: string;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <div className='bg-accent p-2 rounded-full text-accent-foreground'>{icon}</div>
        <div>
          <p className='font-medium text-sidebar-foreground'>{name}</p>
          <p className='text-xs text-muted-foreground'>Last 24h</p>
        </div>
      </div>
      <p className='font-bold text-lg text-sidebar-foreground'>{value}</p>
    </div>
  );
}