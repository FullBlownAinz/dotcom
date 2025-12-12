import React, { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin.ts';
import { useEditMode } from '../../hooks/useEditMode.ts';
import Button from '../ui/Button.tsx';
import { Save, XCircle, GripVertical, Eye, EyeOff } from 'lucide-react';
import EditPostModal from '../modals/EditPostModal.tsx';
import EditMerchModal from '../modals/EditMerchModal.tsx';
import EditAppModal from '../modals/EditAppModal.tsx';
import EditInfoModal from '../modals/EditInfoModal.tsx';
import EditTickerModal from '../modals/EditTickerModal.tsx';
import EditPromoModal from '../modals/EditPromoModal.tsx';
import EditOverlayModal from '../modals/EditOverlayModal.tsx';
import { Post, MerchItem, AppItem, SiteInfo, SiteSettings } from '../../types/index.ts';
import { useSortable } from '../../hooks/useSortable.ts';
import { v4 as uuidv4 } from 'uuid';
import { hidePost, hideMerch, hideApp } from '../../src/edit/actions.ts';
import toast from 'react-hot-toast';


type DraggableItem = Post | MerchItem | AppItem;

// Generic, unified component for managing any list of draggable items.
const DraggableListManager = ({ 
    title, 
    items, 
    setItems, 
    onEdit,
    onToggleHidden,
}: { 
    title: string, 
    items: DraggableItem[], 
    setItems: (items: DraggableItem[]) => void, 
    onEdit: (item: DraggableItem) => void,
    onToggleHidden: (item: DraggableItem) => void,
}) => {
    const sortableRef = useSortable(items, setItems, true);

    // Helper to get the display name of an item since property names differ ('title' vs 'name')
    const getItemName = (item: DraggableItem) => {
        if ('title' in item && item.title) return item.title;
        if ('name' in item && item.name) return item.name;
        return 'Untitled';
    };

    return (
        <div className="space-y-2 mb-6">
            <h3 className="font-display text-lg uppercase text-gray-400 mt-4 border-b border-gray-700 pb-2">{title}</h3>
            {/* Added max-height and overflow-y-auto to list container to ensure scrollbar appears if list is long */}
            <div ref={sortableRef as React.RefObject<HTMLDivElement>} className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-black/30 rounded-md group">
                        <GripVertical className="cursor-grab text-gray-500 flex-shrink-0" size={16} />
                        <span className="flex-grow truncate cursor-pointer hover:underline text-sm" onClick={() => onEdit(item)}>
                            {getItemName(item)}
                        </span>
                        <div className="flex items-center gap-1">
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleHidden(item);
                                }}
                                title={item.hidden ? 'Show' : 'Hide'}
                                className="p-1 hover:text-white text-gray-400 transition-colors focus:outline-none"
                            >
                                {item.hidden ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AdminDrawer: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const { 
        saveChanges, 
        draftPosts, setDraftPosts, 
        draftMerch, setDraftMerch, 
        draftApps, setDraftApps, 
        draftInfo, setDraftInfo,
        supabaseClient,
        settings, updateSettings,
    } = useAdmin();
    const { setEditMode } = useEditMode();
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editingMerch, setEditingMerch] = useState<MerchItem | null>(null);
    const [editingApp, setEditingApp] = useState<AppItem | null>(null);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingTicker, setIsEditingTicker] = useState(false);
    const [isEditingPromo, setIsEditingPromo] = useState(false);
    const [isEditingOverlay, setIsEditingOverlay] = useState(false);
    
    const handleAddNewPost = () => {
        const newPost: Post = { id: uuidv4(), created_at: new Date().toISOString(), title: 'New Post', header_media_url: '', header_media_type: 'image', body_richtext: [], external_links: [], hidden: true, order_index: -1 };
        setEditingPost(newPost);
    };
    
    const handleAddNewMerch = () => {
        const newMerch: MerchItem = { id: uuidv4(), created_at: new Date().toISOString(), name: 'New Merch', image_url: '', price_cents: 0, currency: 'USD', description: '', external_url: '', hidden: true, order_index: -1 };
        setEditingMerch(newMerch);
    };
    
    const handleAddNewApp = () => {
        const newApp: AppItem = { id: uuidv4(), created_at: new Date().toISOString(), name: 'New App', icon_url: '', short_desc: '', body_richtext: [], links: [], hidden: true, order_index: -1 };
        setEditingApp(newApp);
    };

    // --- ACTIONS ---

    // POSTS
    const togglePostHidden = async (post: Post) => {
        const newVal = !post.hidden;
        // Optimistic
        setDraftPosts(prev => prev.map(p => p.id === post.id ? { ...p, hidden: newVal } : p));
        if (supabaseClient) {
            try {
                await hidePost(supabaseClient, post.id, newVal);
            } catch (e) {
                toast.error("Failed to toggle post visibility");
                setDraftPosts(prev => prev.map(p => p.id === post.id ? { ...p, hidden: !newVal } : p));
            }
        }
    };

    // MERCH
    const toggleMerchHidden = async (item: MerchItem) => {
        const newVal = !item.hidden;
        setDraftMerch(prev => prev.map(p => p.id === item.id ? { ...p, hidden: newVal } : p));
        if (supabaseClient) {
            try {
                await hideMerch(supabaseClient, item.id, newVal);
            } catch (e) {
                toast.error("Failed to toggle merch visibility");
                setDraftMerch(prev => prev.map(p => p.id === item.id ? { ...p, hidden: !newVal } : p));
            }
        }
    };

    // APPS
    const toggleAppHidden = async (item: AppItem) => {
        const newVal = !item.hidden;
        setDraftApps(prev => prev.map(p => p.id === item.id ? { ...p, hidden: newVal } : p));
        if (supabaseClient) {
            try {
                await hideApp(supabaseClient, item.id, newVal);
            } catch (e) {
                toast.error("Failed to toggle app visibility");
                setDraftApps(prev => prev.map(p => p.id === item.id ? { ...p, hidden: !newVal } : p));
            }
        }
    };

    // Unified save handlers for all content types
    const onSavePost = (post: Post) => {
        const postExists = draftPosts.some(p => p.id === post.id);
        if (postExists) {
            setDraftPosts(posts => posts.map(p => (p.id === post.id ? post : p)));
        } else {
            setDraftPosts(posts => [post, ...posts]);
        }
        setEditingPost(null);
        toast.success("Changes applied locally. Click 'Save Changes' to persist.");
    };

    const onSaveMerch = (merch: MerchItem) => {
        const itemExists = draftMerch.some(i => i.id === merch.id);
        if (itemExists) {
            setDraftMerch(items => items.map(i => (i.id === merch.id ? merch : i)));
        } else {
            setDraftMerch(items => [merch, ...items]);
        }
        setEditingMerch(null);
        toast.success("Changes applied locally. Click 'Save Changes' to persist.");
    };
    
    const onSaveApp = (app: AppItem) => {
        const itemExists = draftApps.some(i => i.id === app.id);
        if (itemExists) {
            setDraftApps(items => items.map(i => (i.id === app.id ? app : i)));
        } else {
            setDraftApps(items => [app, ...items]);
        }
        setEditingApp(null);
        toast.success("Changes applied locally. Click 'Save Changes' to persist.");
    };

    const onSaveInfo = (info: SiteInfo) => {
        setDraftInfo(info);
        setIsEditingInfo(false);
        toast.success("Changes applied locally. Click 'Save Changes' to persist.");
    };

    const onSaveTicker = async (text: string, speed: number) => {
        if (settings) {
            const newFonts = { ...settings.fonts, ticker: text, tickerSpeed: speed };
            await updateSettings({ fonts: newFonts });
            setIsEditingTicker(false);
        }
    };
    
    const onSavePromo = async (promo: SiteSettings['promo']) => {
        if (settings) {
            await updateSettings({ promo });
            setIsEditingPromo(false);
        }
    };

    const onSaveOverlay = async (overlay: SiteSettings['overlay_animation']) => {
        if (settings) {
            await updateSettings({ overlay_animation: overlay });
            setIsEditingOverlay(false);
        }
    };

    return (
        <aside className={`fixed top-0 right-0 h-full bg-[#0A0A0A] border-l-2 border-gray-800 text-white z-40 transition-transform duration-300 ease-in-out w-full sm:w-[420px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="font-display text-xl uppercase">Edit Mode</h2>
                </div>
                
                <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2 mb-6">
                        <Button onClick={handleAddNewPost} variant="secondary" fullWidth>Add Post</Button>
                        <Button onClick={handleAddNewMerch} variant="secondary" fullWidth>Add Merch</Button>
                        <Button onClick={handleAddNewApp} variant="secondary" fullWidth>Add App</Button>
                        <Button onClick={() => setIsEditingInfo(true)} variant="secondary" fullWidth>Edit Info</Button>
                        <Button onClick={() => setIsEditingTicker(true)} variant="secondary" fullWidth>Edit Ticker</Button>
                        <Button onClick={() => setIsEditingPromo(true)} variant="secondary" fullWidth>Edit Promo</Button>
                        <Button onClick={() => setIsEditingOverlay(true)} variant="secondary" fullWidth>Edit Overlay</Button>
                    </div>
                    
                    <DraggableListManager 
                        title="Posts" 
                        items={draftPosts as DraggableItem[]} 
                        setItems={(items) => setDraftPosts(items as Post[])} 
                        onEdit={(item) => setEditingPost(item as Post)} 
                        onToggleHidden={(item) => togglePostHidden(item as Post)}
                    />
                    <DraggableListManager 
                        title="Merch" 
                        items={draftMerch as DraggableItem[]} 
                        setItems={(items) => setDraftMerch(items as MerchItem[])} 
                        onEdit={(item) => setEditingMerch(item as MerchItem)} 
                        onToggleHidden={(item) => toggleMerchHidden(item as MerchItem)}
                    />
                    <DraggableListManager 
                        title="Apps" 
                        items={draftApps as DraggableItem[]} 
                        setItems={(items) => setDraftApps(items as AppItem[])} 
                        onEdit={(item) => setEditingApp(item as AppItem)} 
                        onToggleHidden={(item) => toggleAppHidden(item as AppItem)}
                    />
                </div>

                <div className="p-4 border-t border-gray-700 flex gap-4">
                    <Button onClick={() => setEditMode(false)} variant="secondary" fullWidth>
                        <XCircle size={16} className="mr-2" />
                        Close
                    </Button>
                    <Button onClick={saveChanges} fullWidth>
                        <Save size={16} className="mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            {editingPost && <EditPostModal post={editingPost} onSave={onSavePost} onClose={() => setEditingPost(null)} />}
            {editingMerch && <EditMerchModal merch={editingMerch} onSave={onSaveMerch} onClose={() => setEditingMerch(null)} />}
            {editingApp && <EditAppModal app={editingApp} onSave={onSaveApp} onClose={() => setEditingApp(null)} />}
            {isEditingInfo && draftInfo && <EditInfoModal info={draftInfo} onSave={onSaveInfo} onClose={() => setIsEditingInfo(false)} />}
            {isEditingTicker && settings && (
                <EditTickerModal 
                    initialText={settings.fonts.ticker || ''} 
                    initialSpeed={settings.fonts.tickerSpeed || 20}
                    onSave={onSaveTicker} 
                    onClose={() => setIsEditingTicker(false)} 
                />
            )}
            {isEditingPromo && settings && (
                <EditPromoModal
                    settings={settings.promo}
                    onSave={onSavePromo}
                    onClose={() => setIsEditingPromo(false)}
                />
            )}
            {isEditingOverlay && settings && (
                <EditOverlayModal
                    settings={settings.overlay_animation}
                    onSave={onSaveOverlay}
                    onClose={() => setIsEditingOverlay(false)}
                />
            )}
        </aside>
    );
};

export default AdminDrawer;