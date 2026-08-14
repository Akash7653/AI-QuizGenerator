import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Globe, Link2, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { documentAPI } from '@/lib/api';

interface DocumentsProps {
  userName?: string;
}

interface SourceItem {
  name: string;
  type: string;
  status: string;
  accent: string;
}

export function Documents({ userName }: DocumentsProps) {
  const { theme } = useThemeMode();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchDocuments = async () => {
      try {
        const documents = await documentAPI.getDocuments(0, 20);
        if (!mounted) return;

        const mapped = (documents || []).map((item: any) => {
          const type = item.document_type || item.type || 'PDF';
          const status = item.status || 'Ready';
          const accent = type === 'WEBSITE_URL' || type === 'URL' ? 'from-emerald-500 to-green-500' : type === 'PASTED_TEXT' || type === 'TEXT' ? 'from-violet-500 to-purple-500' : 'from-cyan-500 to-blue-500';

          return {
            name: item.title || 'Untitled document',
            type: String(type).replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase()),
            status: String(status).replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase()),
            accent,
          };
        });

        setSources(mapped.length ? mapped : [
          { name: 'No documents yet', type: 'Ready', status: 'Empty', accent: 'from-slate-400 to-slate-500' },
        ]);
      } catch (error) {
        console.error('[Documents] Error loading documents:', error);
        if (mounted) setSources([{ name: 'No documents yet', type: 'Ready', status: 'Empty', accent: 'from-slate-400 to-slate-500' }]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDocuments();
    return () => { mounted = false; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className={`rounded-[30px] border p-6 shadow-[0_25px_80px_rgba(8,145,178,0.12)] backdrop-blur-xl ${theme === 'dark' ? 'border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40' : 'border-cyan-200/60 bg-gradient-to-br from-white via-cyan-50 to-sky-50'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>Knowledge Base</p>
            <h1 className={`mt-2 text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{userName ? `${userName}'s Documents` : 'Documents & Sources'}</h1>
          </div>

          <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
            <Plus className="mr-2 h-4 w-4" /> Add Source
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Uploaded', value: loading ? '…' : String(sources.filter((s) => s.name !== 'No documents yet').length), icon: Upload, accent: 'cyan' },
          { label: 'Indexed', value: loading ? '…' : String(sources.filter((s) => s.status.toLowerCase().includes('indexed') || s.status.toLowerCase().includes('ready')).length), icon: FileText, accent: 'blue' },
          { label: 'Live Sources', value: loading ? '…' : String(sources.filter((s) => s.type.toLowerCase().includes('url')).length), icon: Globe, accent: 'violet' },
        ].map((item) => (
          <motion.div key={item.label} whileHover={{ y: -4 }} className={`rounded-3xl border p-5 ${theme === 'dark' ? 'border-slate-700/60 bg-slate-900/70' : 'border-slate-200/70 bg-white/80'}`}>
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent === 'cyan' ? 'from-cyan-500 to-blue-500' : item.accent === 'blue' ? 'from-blue-500 to-indigo-500' : 'from-violet-500 to-purple-500'} text-white`}>
              <item.icon className="h-5 w-5" />
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{item.label}</p>
            <p className={`mt-2 text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2"><Search className="h-4 w-4 text-cyan-500" /> Document Library</CardTitle>
              <CardDescription>Imported materials ready for quiz generation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sources.map((source) => (
            <motion.div
              key={source.name}
              whileHover={{ x: 4 }}
              className={`flex items-center justify-between rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-700/60 bg-slate-900/50' : 'border-slate-200/80 bg-slate-50/80'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${source.accent} text-white`}>
                  {source.type === 'URL' ? <Link2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{source.name}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{source.type}</p>
                </div>
              </div>

              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                {source.status}
              </span>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
