"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Image as ImageIcon, Edit, X, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url?: string;
    is_available: boolean;
};

export default function MenuManager() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [roleLoading, setRoleLoading] = useState(true);
    const router = useRouter();

    // Editing State
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Main");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        async function checkAccess() {
            setRoleLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
                if (data?.role !== 'owner') {
                    router.push('/admin');
                } else {
                    setRoleLoading(false);
                    fetchMenu();
                }
            } else {
                router.push('/portal-v2-auth');
            }
        }
        checkAccess();
    }, [router]);

    const fetchMenu = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching menu:", error);
        } else {
            setMenuItems(data as MenuItem[]);
        }
        setLoading(false);
    };

    const resetForm = () => {
        setEditingItem(null);
        setName("");
        setDesc("");
        setPrice("");
        setCategory("Main");
        setImageUrl("");
    };

    const handleEditClick = (item: MenuItem) => {
        setEditingItem(item);
        setName(item.name);
        setDesc(item.description);
        setPrice(item.price.toString());
        setCategory(item.category);
        setImageUrl(item.image_url || "");

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('menu_images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            alert('Error uploading image');
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('menu_images')
                .getPublicUrl(filePath);

            setImageUrl(publicUrl);
        }
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const itemData = {
            name,
            description: desc,
            price: parseFloat(price),
            category,
            image_url: imageUrl,
            is_available: true
        };

        let result;

        if (editingItem) {
            // Update existing
            result = await supabase
                .from('menu_items')
                .update(itemData)
                .eq('id', editingItem.id);
        } else {
            // Insert new
            result = await supabase
                .from('menu_items')
                .insert(itemData);
        }

        const { error } = result;

        if (error) {
            console.error("Error saving item:", error);
            alert('Failed to save item');
        } else {
            resetForm();
            fetchMenu();
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (error) {
            console.error("Error deleting item:", error);
        } else {
            setMenuItems(prev => prev.filter(i => i.id !== id));
        }
    };

    if (roleLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="bg-white p-6 rounded-[var(--radius)] shadow-sm">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Menu Manager</h1>
                <p className="text-gray-500 text-sm">Add, edit, or remove dishes.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-[var(--radius)] shadow-sm sticky top-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-lg">
                                {editingItem ? `Edit: ${editingItem.name}` : "Add New Item"}
                            </h2>
                            {editingItem && (
                                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Dish Image</label>
                                <div className="flex items-center gap-4">
                                    {imageUrl && (
                                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-[var(--radius)] text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full justify-center">
                                            {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <UploadCloud size={16} />}
                                            {uploading ? "Uploading..." : "Upload Image"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full p-2 border rounded-[var(--radius)] text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                                    placeholder="e.g. Truffle Pasta"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full p-2 border rounded-[var(--radius)] text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                                >
                                    <option>Starter</option>
                                    <option>Main</option>
                                    <option>Dessert</option>
                                    <option>Drink</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full p-2 border rounded-[var(--radius)] text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                    className="w-full p-2 border rounded-[var(--radius)] text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                                    placeholder="Ingredients, taste, etc."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || uploading}
                                className={`w-full py-2 font-semibold rounded-[var(--radius)] hover:opacity-90 transition-opacity flex justify-center items-center gap-2 text-white ${editingItem ? "bg-blue-600" : "bg-[var(--primary)]"
                                    }`}
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : editingItem ? (
                                    <>
                                        <Edit size={16} /> Update Item
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} /> Add Item
                                    </>
                                )}
                            </button>

                            {editingItem && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full py-2 bg-gray-100 text-gray-600 font-semibold rounded-[var(--radius)] hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>
                    ) : menuItems.length === 0 ? (
                        <div className="text-center p-12 text-gray-500 bg-white rounded-[var(--radius)] shadow-sm">
                            No menu items found. Add one to get started.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {menuItems.map(item => (
                                <div key={item.id} className={`bg-white p-4 rounded-[var(--radius)] shadow-sm border flex justify-between items-start group transition-colors ${editingItem?.id === item.id ? "border-[var(--primary)] ring-1 ring-[var(--primary)] bg-orange-50" : "border-gray-100"
                                    }`}>
                                    <div className="flex gap-4">
                                        {item.image_url ? (
                                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {item.category}
                                                </span>
                                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                            <p className="text-[var(--primary)] font-bold mt-2">${item.price.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit Item"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
