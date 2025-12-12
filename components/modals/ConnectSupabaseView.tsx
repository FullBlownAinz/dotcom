import React, { useState } from 'react';
import Input from '../ui/Input.tsx';
import Button from '../ui/Button.tsx';
import toast from 'react-hot-toast';

interface ConnectSupabaseViewProps {
  onConnect: (url: string, key: string) => Promise<void>;
  onCancel: () => void;
}

const ConnectSupabaseView: React.FC<ConnectSupabaseViewProps> = ({ onConnect, onCancel }) => {
    const [url, setUrl] = useState('');
    const [anonKey, setAnonKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || !anonKey) {
            toast.error("Both URL and Key are required.");
            return;
        }
        setIsLoading(true);
        try {
            await onConnect(url, anonKey);
            // Parent component will handle toast and closing
        } catch (error: any) {
            // Error toast is handled by the context to be more specific
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleConnect} className="space-y-4">
            <h3 className="font-display uppercase text-center text-gray-400">Connect to Supabase</h3>
            <Input
                id="supabase-url"
                label="Supabase Project URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
            />
            <Input
                id="supabase-key"
                label="Supabase Anon Key"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                required
            />
            <p className="text-xs text-gray-500">
                You can find these in your Supabase project's API settings.
            </p>
            <div className="flex gap-4 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
                    Cancel
                </Button>
                <Button type="submit" fullWidth disabled={isLoading}>
                    {isLoading ? 'Connecting...' : 'Connect'}
                </Button>
            </div>
        </form>
    );
};

export default ConnectSupabaseView;
