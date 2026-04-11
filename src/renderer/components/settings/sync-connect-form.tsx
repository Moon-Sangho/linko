import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@renderer/components/ui/spinner';

const schema = z.object({
  repoUrl: z.string().min(1, 'Repository URL is required'),
  token: z.string().min(1, 'Personal access token is required'),
});

type FormValues = z.infer<typeof schema>;

interface SyncConnectFormProps {
  onConnect: (repoUrl: string, token: string) => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

export function SyncConnectForm({ onConnect, isConnecting, error }: SyncConnectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await onConnect(values.repoUrl, values.token);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400">Repository URL</label>
        <input
          {...register('repoUrl')}
          type="text"
          placeholder="https://github.com/you/bookmarks.git"
          className="h-8 px-3 text-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
        {errors.repoUrl && <p className="text-xs text-red-400">{errors.repoUrl.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400">Personal Access Token</label>
        <input
          {...register('token')}
          type="password"
          placeholder="ghp_…"
          className="h-8 px-3 text-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-gray-600 leading-relaxed">
          GitHub → Settings → Developer settings → Personal access tokens (Fine-grained)
          <br />
          Required permissions: <span className="text-gray-500">Contents — Read and Write</span>
        </p>
        {errors.token && <p className="text-xs text-red-400">{errors.token.message}</p>}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isConnecting}
        className="flex items-center justify-center gap-2 p-2 mt-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors disabled:opacity-50"
      >
        {isConnecting && <Spinner size="sm" />}
        Connect
      </button>
    </form>
  );
}
