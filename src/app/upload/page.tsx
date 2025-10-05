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
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',background:'#fef3c7',position:'relative',overflow:'hidden'}}>
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
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'flex-start',gap:'18px',marginLeft:'24px'}}>
          <button onClick={handleProcessFile} disabled={!file || isProcessing} className="hb-btn" style={{flex:1,background:'#22c55e',color:'#fff',fontWeight:800,fontSize:'18px',padding:'16px',borderRadius:'12px',boxShadow:'4px 4px 0 #000, 0 12px 18px -4px rgba(0,0,0,0.25)',border:'3px solid #000',cursor:(!file||isProcessing)?'not-allowed':'pointer',opacity:(!file||isProcessing)?0.7:1}}>
            {isProcessing ? 'Processing…' : 'Sync to Calendar'}
          </button>
          <button onClick={handleGenerateHumorousSummary} disabled={!file || isGeneratingHumorous} className="hb-btn" style={{flex:1,background:'#a855f7',color:'#fff',fontWeight:800,fontSize:'18px',padding:'16px',borderRadius:'12px',boxShadow:'4px 4px 0 #000, 0 12px 18px -4px rgba(0,0,0,0.25)',border:'3px solid #000',cursor:(!file||isGeneratingHumorous)?'not-allowed':'pointer',opacity:(!file||isGeneratingHumorous)?0.7:1}}>
            {isGeneratingHumorous ? 'Summarizing…' : 'Summarize Audio'}
          </button>
          <button disabled className="hb-btn" style={{flex:1,background:'#ef4444',color:'#fff',fontWeight:800,fontSize:'18px',padding:'16px',borderRadius:'12px',boxShadow:'4px 4px 0 #000, 0 12px 18px -4px rgba(0,0,0,0.25)',border:'3px solid #000',cursor:'not-allowed',opacity:0.6}}>To-Do (coming soon)</button>
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
      </div>
    </div>
  );
}


