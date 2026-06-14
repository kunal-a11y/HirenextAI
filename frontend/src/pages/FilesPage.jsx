import { useEffect, useState } from 'react';
import ChatLayout from '../components/layout/ChatLayout';
import { useTranslation } from '../hooks/useTranslation';
import useFilesStore, { FILE_FOLDERS } from '../store/useFilesStore';
import { Folder, FileText, Download, Eye, ChevronRight, X } from 'lucide-react';

const FilesPage = () => {
  const { t } = useTranslation();
  const { files, hydrate, getByFolder } = useFilesStore();
  const [activeFolder, setActiveFolder] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const folderFiles = activeFolder ? getByFolder(activeFolder) : [];

  const handleDownload = (file) => {
    const blob = new Blob([file.content || ''], { type: file.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.title.replace(/[^\w\s-]/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ChatLayout>
      <div className="flex-1 flex h-full min-h-0 bg-background animate-fade-in">
        <aside className="w-[240px] shrink-0 border-r border-white/[0.06] p-4 overflow-y-auto custom-scrollbar">
          <h1 className="text-lg font-bold text-white mb-1 px-2">{t('myFiles')}</h1>
          <p className="text-[11px] text-white/35 px-2 mb-4">AI-generated only</p>
          <nav className="space-y-0.5">
            {FILE_FOLDERS.map((folder) => {
              const count = getByFolder(folder.id).length;
              const active = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setActiveFolder(folder.id)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-[13px] transition-colors
                    ${active ? 'bg-purple-500/15 text-white border border-purple-500/25' : 'text-white/60 hover:bg-white/[0.04] hover:text-white'}
                  `}
                >
                  <span>{folder.icon}</span>
                  <span className="flex-1 truncate">{folder.label}</span>
                  <span className="text-[11px] text-white/30">{count}</span>
                  <ChevronRight size={14} className={active ? 'text-purple-400' : 'opacity-0'} />
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          {!activeFolder ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <Folder size={28} className="text-purple-400" />
              </div>
              <p className="text-white/70 font-medium mb-1">Select a folder</p>
              <p className="text-[13px] text-white/35 max-w-sm">
                Files appear here automatically when HirenextAI generates cover letters, resumes, interview notes, and more in chat.
              </p>
            </div>
          ) : folderFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
              <FileText size={40} className="text-white/15 mb-4" />
              <p className="text-white/50">No files in this folder yet.</p>
              <p className="text-[12px] text-white/30 mt-1">Ask the AI to generate content in chat.</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">
                {FILE_FOLDERS.find((f) => f.id === activeFolder)?.label}
              </h2>
              <div className="grid gap-3 max-w-3xl">
                {folderFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-purple-500/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-medium text-white truncate">{file.title}</h3>
                        <p className="text-[12px] text-white/40 mt-1">
                          {new Date(file.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {(file.jobTitle || file.jobCompany) && (
                          <p className="text-[12px] text-purple-400/80 mt-1">
                            {file.jobTitle}
                            {file.jobCompany ? ` · ${file.jobCompany}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[12px] text-white/70 hover:bg-white/[0.06] transition-colors"
                        >
                          <Eye size={14} /> Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(file)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/25 text-[12px] text-purple-300 hover:bg-purple-500/25 transition-colors"
                        >
                          <Download size={14} /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewFile(null)} />
          <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-[#0f0f18] shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-white font-semibold truncate pr-4">{previewFile.title}</h3>
              <button type="button" onClick={() => setPreviewFile(null)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              <pre className="text-[13px] text-white/75 whitespace-pre-wrap font-sans leading-relaxed">
                {previewFile.content || '(Empty file)'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </ChatLayout>
  );
};

export default FilesPage;
