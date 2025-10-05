'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const picked = e.target.files?.[0];
    setResult(null);
    setError(null);
    if (!picked) return;
    if (picked.type !== 'application/pdf' && !picked.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file (.pdf).');
      setFile(null);
      return;
    }
    setFile(picked);
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Select a PDF first.');
      return;
    }
    setIsUploading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Failed to upload. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const callAction = async (route) => {
    if (!file) {
      setError('Upload a PDF first.');
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, size: file.size }) });
      if (!res.ok) throw new Error('Action failed');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Action failed. Please try again.');
    }
  };

  return (
    <div style={{height:'100vh',width:'100vw',background:'#fef3c7',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div style={{background:'#fff',borderRadius:'24px',boxShadow:'6px 6px 0 #000, 0 25px 50px -12px rgba(0,0,0,0.25)',width:'100%',maxWidth:'1200px',height:'100%',display:'flex',padding:'24px',border:'3px solid #000',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:16,left:20,color:'#000',fontWeight:800,fontSize:'36px'}}>Syllable</div>
        <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={onFileChange} style={{display:'none'}} />

        <div style={{flex:1.5,display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'12px',width:'100%',height:'100%',paddingTop:'64px'}}>
            <button onClick={onPickFile} style={{width:'100%',maxWidth:'100%',height:'85%',background:'#3b82f6',color:'#fff',fontSize:'28px',fontWeight:700,borderRadius:'12px',boxShadow:'4px 4px 0 #000, 0 10px 15px -3px rgba(0,0,0,0.2)',border:'3px solid #000',cursor:'pointer'}}>
              {file ? 'Change PDF' : 'Upload PDF'}
            </button>
          </div>
        </div>

        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'flex-start',gap:'16px',marginLeft:'24px'}}>
          <button onClick={() => callAction('deadlines')} style={{flex:1,background:'#22c55e',color:'#fff',fontWeight:600,borderRadius:'10px',boxShadow:'3px 3px 0 #000, 0 10px 15px -3px rgba(0,0,0,0.2)',border:'3px solid #000',cursor:'pointer'}}>Sync to Calendar</button>
          <button onClick={() => callAction('summarize-audio')} style={{flex:1,background:'#a855f7',color:'#fff',fontWeight:600,borderRadius:'10px',boxShadow:'3px 3px 0 #000, 0 10px 15px -3px rgba(0,0,0,0.2)',border:'3px solid #000',cursor:'pointer'}}>Summarize Audio</button>
          <button onClick={() => callAction('todos')} style={{flex:1,background:'#ef4444',color:'#fff',fontWeight:600,borderRadius:'10px',boxShadow:'3px 3px 0 #000, 0 10px 15px -3px rgba(0,0,0,0.2)',border:'3px solid #000',cursor:'pointer'}}>To-Do</button>
          <button onClick={uploadFile} disabled={!file || isUploading} style={{flex:'unset',padding:'12px 16px',background:'#2563eb',color:'#fff',fontWeight:700,borderRadius:'10px',border:'3px solid #000',boxShadow:'3px 3px 0 #000, 0 10px 15px -3px rgba(0,0,0,0.2)',cursor:'pointer',opacity:(!file||isUploading)?0.7:1}}>
            {isUploading ? 'Uploading…' : 'Save to App'}
          </button>
          {file && (
            <div style={{padding:'8px 10px',border:'3px dashed #000',borderRadius:'10px',background:'#fff'}}>
              <span style={{fontWeight:600,marginRight:'6px'}}>{file.name}</span>
              <span style={{opacity:0.7}}>({(file.size/1024/1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>
      </div>

      <div style={{position:'fixed',left:16,right:16,bottom:16,display:'flex',flexDirection:'column',gap:8,maxWidth:1200,margin:'0 auto'}}>
        {error && <div style={{padding:'10px 12px',background:'#ef4444',color:'#fff',border:'3px solid #000',borderRadius:'10px',maxWidth:'100%',boxShadow:'3px 3px 0 #000'}} role="alert">{error}</div>}
        {result && <pre style={{margin:0,background:'#faf9f6',border:'3px solid #000',borderRadius:'12px',padding:'12px',boxShadow:'inset 0 0 0 2px #fff,4px 4px 0 #000',maxHeight:240,overflow:'auto'}}>{JSON.stringify(result,null,2)}</pre>}
      </div>
    </div>
  );
}


