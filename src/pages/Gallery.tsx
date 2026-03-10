import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_GALLERY } from '@/data/mockData';
import { GalleryImage } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image as ImageIcon, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

const Gallery = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>(MOCK_GALLERY);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const handleAdd = () => {
    if (!title || !url) { toast.error('Fill all fields'); return; }
    const img: GalleryImage = { id: `g${Date.now()}`, title, imageUrl: url, uploadedBy: user!.name, uploadedAt: new Date().toISOString().split('T')[0] };
    setImages(prev => [img, ...prev]);
    toast.success('Image uploaded!');
    setTitle(''); setUrl(''); setOpen(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><ImageIcon className="w-6 h-6 text-primary" /> Community Gallery</h1>
          {(user?.role === 'admin' || user?.role === 'resident') && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="rounded-xl ripple-btn gap-2"><Plus className="w-4 h-4" /> Upload Image</Button></DialogTrigger>
              <DialogContent className="glass-card border-border/50">
                <DialogHeader><DialogTitle className="font-display">Upload Image</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <div><Label>Image URL</Label><Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="bg-secondary/50 border-border/50 rounded-xl" /></div>
                  <Button className="w-full rounded-xl ripple-btn" onClick={handleAdd}>Upload</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <motion.div key={img.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
              className="glass-card overflow-hidden rounded-2xl cursor-pointer group hover-lift" onClick={() => setLightbox(i)}>
              <div className="aspect-video relative overflow-hidden">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-medium text-sm">{img.title}</p>
                  <p className="text-xs text-muted-foreground">{img.uploadedBy}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightbox !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
              <button className="absolute top-6 right-6 text-foreground" onClick={() => setLightbox(null)}><X className="w-6 h-6" /></button>
              {lightbox > 0 && (
                <button className="absolute left-4 top-1/2 -translate-y-1/2" onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}><ChevronLeft className="w-8 h-8" /></button>
              )}
              {lightbox < images.length - 1 && (
                <button className="absolute right-4 top-1/2 -translate-y-1/2" onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}><ChevronRight className="w-8 h-8" /></button>
              )}
              <motion.img key={lightbox} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                src={images[lightbox].imageUrl} alt={images[lightbox].title} className="max-w-full max-h-[80vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Gallery;
