import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Post, MerchItem, AppItem, SiteInfo, SiteSettings } from '../types/index.ts';
import toast from 'react-hot-toast';
import { editMode } from './EditModeContext.tsx';
import { sampleData } from '../data/sampleData.ts';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

// Default settings for first-time load
const defaultSettings: SiteSettings = {
    id: true,
    colors: { bg: '#000000', fg: '#FFFFFF', accent: '#E10600' },
    fonts: { display: 'Press Start 2P', base: 'Inter', ticker: '', tickerSpeed: 20 },
    promo: { enabled: false, image_url: '', link_url: '' },
    overlay_animation: { enabled: false, type: 'snow' },
    header_overlay_url: null,
    density: 'M'
};

interface AdminContextType {
  // Connection
  isConnected: boolean;
  supabaseClient: SupabaseClient | null;
  connectToSupabase: (url: string, key: string) => Promise<void>;
  
  // Auth
  session: Session | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Public Data
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  merch: MerchItem[];
  setMerch: React.Dispatch<React.SetStateAction<MerchItem[]>>;
  apps: AppItem[];
  setApps: React.Dispatch<React.SetStateAction<AppItem[]>>;
  siteInfo: SiteInfo | null;
  settings: SiteSettings | null;
  loading: boolean;

  // Admin Draft Data
  draftPosts: Post[];
  draftMerch: MerchItem[];
  draftApps: AppItem[];
  draftInfo: SiteInfo | null;

  // Actions
  setDraftPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  setDraftMerch: React.Dispatch<React.SetStateAction<MerchItem[]>>;
  setDraftApps: React.Dispatch<React.SetStateAction<AppItem[]>>;
  setDraftInfo: React.Dispatch<React.SetStateAction<SiteInfo | null>>;
  saveChanges: () => Promise<void>;
  createStandInPost: () => Promise<void>;
  
  // Settings specific
  applySettings: (settingsToApply: SiteSettings) => void;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Public data state
  const [posts, setPosts] = useState<Post[]>([]);
  const [merch, setMerch] = useState<MerchItem[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(defaultSettings);

  // Draft states
  const [draftPosts, setDraftPosts] = useState<Post[]>([]);
  const [draftMerch, setDraftMerch] = useState<MerchItem[]>([]);
  const [draftApps, setDraftApps] = useState<AppItem[]>([]);
  const [draftInfo, setDraftInfo] = useState<SiteInfo | null>(null);
  
  // State to hold original drafts for diffing deletes
  const [initialDraftPosts, setInitialDraftPosts] = useState<Post[]>([]);
  const [initialDraftMerch, setInitialDraftMerch] = useState<MerchItem[]>([]);
  const [initialDraftApps, setInitialDraftApps] = useState<AppItem[]>([]);

  // Hardcoded credentials provided by the user
  const supabaseUrl = 'https://qqisrgbynwcsvwvubkmm.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaXNyZ2J5bndjc3Z3dnVia21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzU2NzUsImV4cCI6MjA3Njc1MTY3NX0.Q31LpowhKstiBYQA8piFKNPvzOILrOZuFrpTLehSxdA';

  const applySettings = useCallback((settingsToApply: SiteSettings | null) => {
    const s = settingsToApply || defaultSettings;
    const root = document.documentElement;
    root.style.setProperty('--fba-black', s.colors.bg);
    root.style.setProperty('--fba-white', s.colors.fg);
    root.style.setProperty('--fba-red', s.colors.accent);
  }, []);

  const fetchPublicData = useCallback(async (client: SupabaseClient) => {
    setLoading(true);
    const results = await Promise.all([
      client.from('posts').select('*').eq('hidden', false).order('order_index'),
      client.from('merch').select('*').eq('hidden', false).order('order_index'),
      client.from('apps').select('*').eq('hidden', false).order('order_index'),
      client.from('site_info').select('*').eq('id', true).single(),
      client.from('site_settings').select('*').eq('id', true).single(),
    ]);

    const [postsRes, merchRes, appsRes, infoRes, settingsRes] = results;
    
    // Fallback to sample data if fetch fails but still connected
    if (postsRes.data) setPosts(postsRes.data as Post[]); else setPosts(sampleData.posts);
    if (merchRes.data) setMerch(merchRes.data as MerchItem[]); else setMerch(sampleData.merch);
    if (appsRes.data) setApps(appsRes.data as AppItem[]); else setApps(sampleData.apps);
    if (infoRes.data) setSiteInfo(infoRes.data as SiteInfo); else setSiteInfo(sampleData.site_info);
    
    if (settingsRes.data) {
        setSettings(settingsRes.data as SiteSettings);
        applySettings(settingsRes.data as SiteSettings);
    } else {
        applySettings(defaultSettings);
    }

    setLoading(false);
  }, [applySettings]);

  useEffect(() => {
    // Directly create the client with hardcoded credentials
    const client = createClient(supabaseUrl, supabaseAnonKey);
    setSupabaseClient(client);
    setIsConnected(true); // Always connected
    fetchPublicData(client);

    client.auth.getSession().then(({ data: { session }}) => {
      setSession(session);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, [fetchPublicData, applySettings, supabaseUrl, supabaseAnonKey]);

  // Realtime Subscriptions
  useEffect(() => {
    if (!supabaseClient) return;
    
    const handleDbChange = () => fetchPublicData(supabaseClient);
    
    const changes = supabaseClient
      .channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, handleDbChange)
      .subscribe();
      
    return () => {
      supabaseClient.removeChannel(changes);
    };
  }, [supabaseClient, fetchPublicData]);

  const connectToSupabase = async (url: string, key: string) => {
    try {
      const client = createClient(url, key);
      // Test connection
      const { error } = await client.from('posts').select('id').limit(1);
      if (error) throw error;
      
      localStorage.setItem('fba-supabase-url', url);
      localStorage.setItem('fba-supabase-anon-key', key);
      
      setSupabaseClient(client);
      setIsConnected(true);
      fetchPublicData(client);
      toast.success("Successfully connected to Supabase!");
    } catch(e: any) {
        console.error("Supabase connection failed:", e);
        toast.error(`Connection failed: ${e.message}`);
        throw e;
    }
  };

  const login = async (email: string, pass: string) => {
    if (!supabaseClient) throw new Error("Not connected to Supabase.");
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const logout = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    editMode.set(false);
  };
  
  const fetchDataForEditMode = useCallback(async () => {
    if (!supabaseClient) {
        toast.error("Not connected. Cannot fetch data.");
        return;
    }
    toast.loading('Loading all content from Supabase...');
    
    const results = await Promise.all([
      supabaseClient.from('posts').select('*').order('order_index'),
      supabaseClient.from('merch').select('*').order('order_index'),
      supabaseClient.from('apps').select('*').order('order_index'),
      supabaseClient.from('site_info').select('*').eq('id', true).single()
    ]);

    const [postsRes, merchRes, appsRes, infoRes] = results;
    
    if (postsRes.data) {
        const data = postsRes.data as Post[];
        setDraftPosts(data);
        setInitialDraftPosts(data);
    }
    if (merchRes.data) {
        const data = merchRes.data as MerchItem[];
        setDraftMerch(data);
        setInitialDraftMerch(data);
    }
    if (appsRes.data) {
        const data = appsRes.data as AppItem[];
        setDraftApps(data);
        setInitialDraftApps(data);
    }
    if (infoRes.data) setDraftInfo(infoRes.data as SiteInfo);

    toast.dismiss();
    toast.success('Content loaded for editing.');
  }, [supabaseClient]);

  useEffect(() => {
    return editMode.subscribe(() => {
        if (editMode.on) {
            fetchDataForEditMode();
        }
    });
  }, [fetchDataForEditMode]);

  const createStandInPost = async () => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient.from('posts').insert({
        title: 'Stand-in Post',
        header_media_url: 'https://placehold.co/600x400',
        header_media_type: 'image',
        body_richtext: [],
        external_links: [],
        hidden: true,
        order_index: 9999
      });

      if (error) throw error;
      fetchPublicData(supabaseClient);
    } catch (error) {
      console.error('Insert failed:', error);
    }
  };

  const saveChanges = async () => {
    if (!supabaseClient) {
        toast.error("Not connected. Cannot save.");
        return;
    }
    const savingToast = toast.loading('Saving all changes to Supabase...');
    try {
        const postPayload = draftPosts.map((p, i) => ({ ...p, order_index: i }));
        const merchPayload = draftMerch.map((m, i) => ({ ...m, order_index: i }));
        const appPayload = draftApps.map((a, i) => ({ ...a, order_index: i }));

        // Diffing to find deleted items using the initial state
        const draftPostIds = new Set(draftPosts.map(p => p.id));
        const postsToDelete = initialDraftPosts.filter(p => !draftPostIds.has(p.id)).map(p => p.id);

        const draftMerchIds = new Set(draftMerch.map(m => m.id));
        const merchToDelete = initialDraftMerch.filter(m => !draftMerchIds.has(m.id)).map(m => m.id);
        
        const draftAppIds = new Set(draftApps.map(a => a.id));
        const appsToDelete = initialDraftApps.filter(a => !draftAppIds.has(a.id)).map(a => a.id);

        // FIX: Explicitly type the promises array to 'any[]' to avoid type inference issues
        // with different Supabase query builders from various tables and methods.
        const promises: any[] = [
          supabaseClient.from('posts').upsert(postPayload),
          supabaseClient.from('merch').upsert(merchPayload),
          supabaseClient.from('apps').upsert(appPayload),
        ];
        
        if (draftInfo) {
          promises.push(supabaseClient.from('site_info').update(draftInfo as SiteInfo).eq('id', true));
        }
        if (postsToDelete.length > 0) {
          promises.push(supabaseClient.from('posts').delete().in('id', postsToDelete));
        }
        if (merchToDelete.length > 0) {
          promises.push(supabaseClient.from('merch').delete().in('id', merchToDelete));
        }
        if (appsToDelete.length > 0) {
          promises.push(supabaseClient.from('apps').delete().in('id', appsToDelete));
        }
        
        const results = await Promise.all(promises);
        for (const res of results) {
            if (res && res.error) {
                throw res.error;
            }
        }

      toast.success('All changes saved to Supabase!', { id: savingToast });
      // After successful save, update the initial state to match the new state for subsequent saves.
      setInitialDraftPosts(draftPosts);
      setInitialDraftMerch(draftMerch);
      setInitialDraftApps(draftApps);

    } catch (e: any) {
        console.error("Save failed:", e);
        // Safely extract error message
        let detail = "Check console for details.";
        if (e) {
            if (typeof e.message === 'string' && e.message.trim() !== '') {
                detail = e.message;
            } else if (typeof e === 'string') {
                detail = e;
            } else {
                try {
                    const jsonDetail = JSON.stringify(e);
                    if (jsonDetail !== '{}') {
                        detail = jsonDetail;
                    }
                } catch (stringifyError) {
                    // Ignore circular structure errors
                }
            }
        }
        toast.error(`Save failed: ${detail}`, { id: savingToast, duration: 6000 });
    }
  };
  
  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    if (!supabaseClient) {
        toast.error("Not connected. Cannot save settings.");
        return;
    };
    if (!settings) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings); // Optimistic update
    applySettings(updatedSettings);

    const { error } = await supabaseClient.from('site_settings').update(updatedSettings).eq('id', true);
    if (error) {
        toast.error(`Failed to save settings: ${error.message}`);
    } else {
        toast.success('Settings saved!');
    }
  };

  const value = { 
    isConnected, supabaseClient, connectToSupabase,
    session, login, logout,
    posts, setPosts, 
    merch, setMerch,
    apps, setApps,
    siteInfo, settings, loading,
    draftPosts, setDraftPosts,
    draftMerch, setDraftMerch,
    draftApps, setDraftApps,
    draftInfo, setDraftInfo,
    saveChanges,
    createStandInPost,
    applySettings,
    updateSettings
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};