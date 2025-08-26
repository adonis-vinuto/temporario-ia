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
        <div className='bg-zinc-800 p-2 rounded-full'>{icon}</div>
        <div>
          <p className='font-medium'>{name}</p>
          <p className='text-xs text-zinc-400'>Last 24h</p>
        </div>
      </div>
      <p className='font-bold text-lg'>{value}</p>
    </div>
  );
}
