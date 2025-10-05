'use client';

import { useState, useRef } from 'react';
import FileUpload from '../components/FileUpload';
import FileInfo from '../components/FileInfo';
import ProcessButton from '../components/ProcessButton';
import ErrorDisplay from '../components/ErrorDisplay';
import SyllabusResults from '../components/SyllabusResults';

/**
 * Main component for PDF upload and AI processing
 * Handles file upload, drag & drop, and displays AI-generated summaries
 */
type SyllabusData = {
  course_name?: string;
  course_code?: string;
  professor?: {
    name?: string;
    email?: string;
    office_hours?: string;
  };
  class_schedule?: string;
  homework?: Array<{ title: string; due_date: string; description?: string }>;
  exams?: Array<{ type: string; date: string; description?: string }>;
  projects?: Array<{ title: string; due_date: string; description?: string }>;
};

export default function UploadPage() {
  // State management for file upload and processing
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<SyllabusData | null>(null);
  const [error, setError] = useState<string>('');
  
  // State for humorous summary
  const [humorousSummary, setHumorousSummary] = useState<string>('');
  const [isGeneratingHumorous, setIsGeneratingHumorous] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [showTodo, setShowTodo] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  
  // Ref for the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection from the file input
   * @param e - File input change event
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Clear previous results and errors when new file is selected
      setResult(null);
      setError('');
    }
  };

  /**
   * Prevents default drag behavior to allow custom drop handling
   * @param e - Drag over event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  /**
   * Handles file drop from drag and drop interface
   * @param e - Drop event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      // Clear previous results and errors when new file is dropped
      setResult(null);
      setError('');
    }
  };

  /**
   * Processes the uploaded PDF file with Gemini AI
   * Sends file to backend API and handles response
   */
  const handleProcessFile = async (): Promise<void> => {
    if (!file) return;

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      // Create FormData to send file to API
      const formData = new FormData();
      formData.append('file', file);

      // Send POST request to process-pdf API endpoint
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const data = await response.json();
      setResult(data.result as SyllabusData);
    } catch (err) {
      // Handle errors gracefully with user-friendly messages
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Clears the selected file and resets the file input
   */
  const clearFile = (): void => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Generates a humorous summary of the syllabus
   */
  const handleGenerateHumorousSummary = async (): Promise<void> => {
    if (!file) return;

    setIsGeneratingHumorous(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/generate-humorous-summary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate humorous summary');
      }

      const data = await response.json();
      setHumorousSummary(data.result);

      // Trigger audio generation and show bottom loading indicator
      setIsGeneratingAudio(true);
      setAudioUrl('');
      try {
        const audioResponse = await fetch('/api/generate-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: data.result }),
        });
        if (!audioResponse.ok) {
          throw new Error('Failed to generate audio');
        }
        const audioBlob = await audioResponse.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } catch (e) {
        console.error('Audio generation failed', e);
      } finally {
        setIsGeneratingAudio(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGeneratingHumorous(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',gap:'32px',padding:'24px',background:'#fef3c7',position:'relative'}}>
      {/* Background shapes */}
      <div className="hb-shape hb-circle" style={{left:-60, top:-40}} />
      <div className="hb-shape hb-circle hb-2" />
      <div className="hb-shape hb-triangle" style={{left: -30, bottom: -20}} />

      <div style={{background:'#fff',borderRadius:'24px',boxShadow:'6px 6px 0 #000, 0 25px 50px -12px rgba(0,0,0,0.25)',width:'100%',maxWidth:'1300px',height:'92vh',display:'flex',padding:'28px',border:'3px solid #000',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:16,left:20,color:'#000',fontWeight:800,fontSize:'36px'}}>Syllable</div>

        {/* Hidden file input for click-to-upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          style={{display:'none'}}
        />

        {/* Left column: big upload button */}
        <div style={{flex:1.5,display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'16px',width:'100%',height:'100%',paddingTop:'72px'}}>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{width:'100%',height:'90%'}}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="hb-btn"
                style={{width:'100%',height:'100%',background:'#3b82f6',color:'#fff',fontSize:'32px',fontWeight:800,borderRadius:'14px',boxShadow:'5px 5px 0 #000, 0 12px 18px -4px rgba(0,0,0,0.25)',border:'3px solid #000',cursor:'pointer'}}
              >
                {file ? 'Change PDF' : 'Upload PDF'}
              </button>
            </div>
            {file && (
              <div style={{padding:'8px 10px',border:'3px dashed #000',borderRadius:'10px',background:'#fff'}}>
                <span style={{fontWeight:600,marginRight:'6px'}}>{file.name}</span>
                <span style={{opacity:0.7}}>({(file.size/1024/1024).toFixed(2)} MB)</span>
                <button onClick={clearFile} style={{marginLeft:12,padding:'4px 8px',border:'2px solid #000',borderRadius:8,background:'#fff',boxShadow:'2px 2px 0 #000',cursor:'pointer'}}>Remove</button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: action buttons */}
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'flex-start',gap:'18px',marginLeft:'24px',position:'relative',zIndex:1}}>
          <button onClick={()=>setShowCalendar(v=>!v)} disabled={!result} className="hb-btn" style={{flex:1,background:'#22c55e',color:'#fff',fontWeight:800,fontSize:'18px',padding:'16px',borderRadius:'12px',boxShadow:'4px 4px 0 #000, 0 12px 18px -4px rgba(0,0,0,0.25)',border:'3px solid #000',cursor:result? 'pointer':'not-allowed',opacity:result?1:0.7}}>
            {showCalendar ? 'Hide Calendar' : 'Calendar'}
          </button>
          <button onClick={handleGenerateHumorousSummary} disabled={!file || isGeneratingHumorous} className="hb-btn" style={{flex:1,background:'#a855f7',color:'#fff',fontWeight:800,fontSize:'18px',padding:'16px',borderRadius:'12px',boxShadow:'4px 4px 0 #000, 0 12px 18px -4px rgba(0,0,0,0.25)',border:'3px solid #000',cursor:(!file||isGeneratingHumorous)?'not-allowed':'pointer',opacity:(!file||isGeneratingHumorous)?0.7:1}}>
            {isGeneratingHumorous ? 'Summarizing…' : 'Summarize Audio'}
          </button>
          <button onClick={()=>setShowTodo(v=>!v)} className="hb-btn" style={{flex:1,background:'#ef4444',color:'#fff',fontWeight:800,fontSize:'18px',padding:'16px',borderRadius:'12px',boxShadow:'4px 4px 0 #000, 0 12px 18px -4px rgba(0,0,0,0.25)',border:'3px solid #000',cursor:'pointer'}}>
            {showTodo ? 'Hide To-Do' : 'To-Do'}
          </button>
        </div>

        {/* Bottom: errors, results, and audio */}
        <div style={{position:'absolute',left:24,right:24,bottom:24,display:'flex',flexDirection:'column',gap:8}}>
          {!!error && (
            <div style={{padding:'10px 12px',background:'#ef4444',color:'#fff',border:'3px solid #000',borderRadius:'10px',boxShadow:'3px 3px 0 #000'}}>{error}</div>
          )}
          {isGeneratingAudio && (
            <div style={{background:'#111',color:'#fff',borderRadius:8,boxShadow:'3px 3px 0 #000',padding:'8px 12px',display:'inline-flex',alignItems:'center',gap:8}}>Preparing audio summary…</div>
          )}
          {audioUrl && !isGeneratingAudio && (
            <div style={{background:'#fff',border:'3px solid #000',borderRadius:12,boxShadow:'3px 3px 0 #000',padding:12}}>
              <audio controls src={audioUrl} style={{width:'100%'}} />
            </div>
          )}
        </div>
        {/* To-Do panel (inside board) */}
        {showTodo && (
          <div style={{position:'absolute',inset:'80px 28px 90px 28px',background:'#fff',border:'3px solid #000',borderRadius:'16px',boxShadow:'6px 6px 0 #000',padding:'18px',overflow:'auto',zIndex:2}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
              <div style={{fontWeight:800,fontSize:'24px',color:'#000'}}>To-Do</div>
              <button onClick={()=>setShowTodo(false)} className="hb-btn" style={{padding:'6px 10px',border:'3px solid #000',borderRadius:'10px',background:'#fff',boxShadow:'3px 3px 0 #000',cursor:'pointer'}}>Close</button>
            </div>
            {(() => {
              const items: Array<{ title: string; due: string }> = [];
              const format = (d?: string) => {
                if (!d) return '';
                try { return new Date(d).toLocaleString(undefined, { year:'numeric', month:'short', day:'numeric' }); } catch { return d; }
              };
              if (result?.homework?.length) {
                result.homework.forEach(h => items.push({ title: h.title || 'Assignment', due: format(h.due_date) }));
              }
              if (result?.projects?.length) {
                result.projects.forEach(p => items.push({ title: p.title || 'Project', due: format(p.due_date) }));
              }
              if (result?.exams?.length) {
                result.exams.forEach(e => items.push({ title: e.type || 'Exam', due: format(e.date) }));
              }
              if (items.length === 0) {
                return (
                  <div style={{border:'3px solid #000',borderRadius:'12px',padding:'16px',boxShadow:'4px 4px 0 #000',background:'#fff',fontSize:'18px'}}>
                    You are Up to Date with your College Assignments
                  </div>
                );
              }
              return (
                <div style={{border:'3px solid #000',borderRadius:'16px',overflow:'hidden',background:'#fff',boxShadow:'4px 4px 0 #000'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr'}}>
                    <div style={{padding:'12px 14px',borderBottom:'3px solid #000',borderRight:'3px solid #000',fontWeight:800}}>Assignment</div>
                    <div style={{padding:'12px 14px',borderBottom:'3px solid #000',fontWeight:800}}>Due date</div>
                  </div>
                  {items.map((it, idx) => (
                    <div key={idx} style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',borderTop: idx===0? '': '3px solid #000'}}>
                      <div style={{padding:'12px 14px',borderRight:'3px solid #000'}}>{it.title}</div>
                      <div style={{padding:'12px 14px'}}>{it.due || '—'}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Calendar panel (inside board) */}
        {showCalendar && (
          <div style={{position:'absolute',inset:'80px 28px 90px 28px',background:'#fff',border:'3px solid #000',borderRadius:'16px',boxShadow:'6px 6px 0 #000',padding:'18px',overflow:'auto',zIndex:2}}>
            {/* Autumn leaves accents */}
            <svg width="120" height="120" style={{position:'absolute',left:14,top:14,opacity:.15}} viewBox="0 0 24 24">
              <path fill="#8B4513" d="M12 2c4 4 6 8 6 12s-2 6-6 6-6-2-6-6 2-8 6-12z" />
            </svg>
            <svg width="90" height="90" style={{position:'absolute',right:18,bottom:18,opacity:.15}} viewBox="0 0 24 24">
              <path fill="#A0522D" d="M12 2c3 3 5 6 5 9s-2 5-5 5-5-2-5-5 2-6 5-9z" />
            </svg>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
              <div style={{fontWeight:800,fontSize:'24px',color:'#000'}}>Calendar</div>
              <button onClick={()=>setShowCalendar(false)} className="hb-btn" style={{padding:'6px 10px',border:'3px solid #000',borderRadius:'10px',background:'#fff',boxShadow:'3px 3px 0 #000',cursor:'pointer'}}>Close</button>
            </div>
            {(() => {
              const map: Record<string, Array<{ title: string }>> = {};
              const addItem = (dateStr?: string, title?: string) => {
                if (!dateStr) return;
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return;
                const key = d.toISOString().slice(0,10);
                (map[key] ||= []).push({ title: title || 'Assignment' });
              };
              result?.homework?.forEach(h => addItem(h.due_date, h.title));
              result?.projects?.forEach(p => addItem(p.due_date, p.title));
              result?.exams?.forEach(e => addItem(e.date, e.type));

              const now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth();
              const first = new Date(year, month, 1);
              const last = new Date(year, month + 1, 0);
              const startWeekday = first.getDay();
              const totalDays = last.getDate();

              const isHoliday = (y:number,m:number,day:number) => {
                const wd = new Date(y,m,day).getDay();
                return wd === 0 || wd === 6;
              };

              const cells: JSX.Element[] = [];
              for (let i=0;i<startWeekday;i++) cells.push(<div key={'blank-'+i} />);
              for (let day=1; day<=totalDays; day++) {
                const dateKey = new Date(year,month,day).toISOString().slice(0,10);
                const items = map[dateKey] || [];
                const holiday = isHoliday(year,month,day);
                cells.push(
                  <div key={day} style={{border:'2px solid #000',borderRadius:'10px',padding:'8px',background:'#fff',position:'relative',boxShadow:'3px 3px 0 #000'}}>
                    <div style={{fontWeight:800,color: holiday ? '#dc2626' : '#000'}}>{day}</div>
                    <div style={{marginTop:'6px',display:'flex',flexDirection:'column',gap:'4px'}}>
                      {holiday && <div style={{color:'#dc2626',fontSize:'12px'}}>Holiday</div>}
                      {items.map((it, idx) => (
                        <div key={idx} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                          <span role="img" aria-label="reading">📖</span>
                          <span style={{fontSize:'12px',color:'#000'}}>{it.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <div>
                  <div style={{fontWeight:700,marginBottom:'8px',color:'#000'}}>{now.toLocaleString(undefined,{month:'long',year:'numeric'})}</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)',gap:'10px'}}>
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>
                      <div key={d} style={{textAlign:'center',fontWeight:700,color:'#000'}}>{d}</div>
                    )}
                    {cells}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      {/* About Us & Features whiteboard (restored) */}
      <div style={{background:'#fff',borderRadius:'24px',boxShadow:'6px 6px 0 #000, 0 18px 36px -12px rgba(0,0,0,0.2)',width:'100%',maxWidth:'1100px',padding:'28px',border:'3px solid #000',position:'relative'}}>
        <div style={{position:'absolute',top:16,left:20,color:'#000',fontWeight:800,fontSize:'30px'}}>About Us</div>
        <div style={{marginTop:'64px',color:'#111',fontSize:'18px',lineHeight:1.5}}>
          <p style={{marginBottom:'12px'}}>We built Syllable to turn dense course syllabi into actionable plans with a friendly, handwritten whiteboard experience.</p>
          <p style={{marginBottom:'20px'}}>Upload a PDF to extract deadlines, generate audio summaries, and keep track of what matters most each week.</p>
          <div style={{fontWeight:800,fontSize:'26px',marginTop:'12px',marginBottom:'12px'}}>Our Features</div>
          <ul style={{listStyle:'none',padding:0,margin:0,display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:'12px'}}>
            <li style={{border:'3px solid #000',borderRadius:'12px',padding:'12px',boxShadow:'4px 4px 0 #000',background:'#fff'}}>PDF parsing for assignments, exams, and projects</li>
            <li style={{border:'3px solid #000',borderRadius:'12px',padding:'12px',boxShadow:'4px 4px 0 #000',background:'#fff'}}>Auto-detected key dates ready for calendar sync</li>
            <li style={{border:'3px solid #000',borderRadius:'12px',padding:'12px',boxShadow:'4px 4px 0 #000',background:'#fff'}}>Humorous, high-level summaries with optional audio</li>
            <li style={{border:'3px solid #000',borderRadius:'12px',padding:'12px',boxShadow:'4px 4px 0 #000',background:'#fff'}}>Simple, focus-first whiteboard interface</li>
          </ul>
        </div>
      </div>

        {/* Removed external To-Do board; now appears inside the To-Do button panel */}
    </div>
  );
}


