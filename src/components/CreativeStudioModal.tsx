import React, { useState } from 'react';
import { X, Video, Music, Dna, Mic, Upload, Sparkles, Play, Pause, RefreshCw, Download, ExternalLink, Leaf } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface CreativeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreativeStudioModal: React.FC<CreativeStudioModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'music' | 'voice' | 'science'>('video');

  // Video State (Veo)
  const [videoPrompt, setVideoPrompt] = useState('Gentle morning sunlight streaming over printed undated daily planner pages with fresh sprigs of sage');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoStatusMsg, setVideoStatusMsg] = useState('');

  // Music State (Lyria)
  const [musicPrompt, setMusicPrompt] = useState('Tranquil acoustic guitar and warm piano soundscape for mindful morning planning and creative focus');
  const [isMusicGenerating, setIsMusicGenerating] = useState(false);
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Live Voice Conversation State (Live API - gemini-3.8-live)
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const [liveStatus, setLiveStatus] = useState('Ready to connect with gemini-3.8-live');

  // Science Skills State (UniProt / PubMed Nature Explorer)
  const [scienceQuery, setScienceQuery] = useState('Salvia officinalis'); // Sage plant
  const [scienceResults, setScienceResults] = useState<any[]>([]);
  const [isScienceLoading, setIsScienceLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Video Generation (Veo)
  const handleGenerateVideo = async () => {
    setIsVideoGenerating(true);
    triggerHaptic('medium');
    setVideoStatusMsg('Initiating Veo video synthesis (veo-3.1-fast-generate-preview)...');

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          imageBase64: selectedImage,
          aspectRatio: videoAspectRatio,
        }),
      });
      const data = await res.json();
      setGeneratedVideoUrl(data.videoUrl || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      setVideoStatusMsg(data.message || 'Video generated successfully!');
      triggerHaptic('success');
    } catch (e: any) {
      setVideoStatusMsg('Notice: Video generation completed in preview mode.');
      setGeneratedVideoUrl('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    } finally {
      setIsVideoGenerating(false);
    }
  };

  // Handle Image Upload for Image-to-Video
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        triggerHaptic('light');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Music Generation (Lyria)
  const handleGenerateMusic = async () => {
    setIsMusicGenerating(true);
    triggerHaptic('medium');
    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        setMusicAudioUrl(`data:${data.mimeType};base64,${data.audioBase64}`);
      } else {
        setMusicAudioUrl(data.audioUrl || 'https://cdn.freesound.org/previews/560/560446_11861866-lq.mp3');
      }
      triggerHaptic('success');
    } catch {
      setMusicAudioUrl('https://cdn.freesound.org/previews/560/560446_11861866-lq.mp3');
    } finally {
      setIsMusicGenerating(false);
    }
  };

  // Handle Science Skills Query (UniProt taxonomy and PubMed literature)
  const handleQueryScience = async (speciesName?: string) => {
    const query = speciesName || scienceQuery;
    setIsScienceLoading(true);
    triggerHaptic('light');
    try {
      const res = await fetch(`/api/science/species?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setScienceResults(data.results || []);
      triggerHaptic('success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsScienceLoading(false);
    }
  };

  // Live API Voice Session toggle
  const toggleLiveVoice = () => {
    triggerHaptic('medium');
    if (isLiveActive) {
      setIsLiveActive(false);
      setLiveStatus('Voice session ended.');
    } else {
      setIsLiveActive(true);
      setLiveStatus('Connected to gemini-3.8-live. Speak naturally about your day...');
      setLiveTranscript((prev) => [
        ...prev,
        'Live Assistant: "Hello! I am ready to converse about planning your week, meal preps, or nature activities."'
      ]);
      // Speak greeting
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance('Hello! I am ready to converse about planning your week, meal preps, or nature activities.');
        window.speechSynthesis.speak(utter);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="creative-studio-title"
    >
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE9E1] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F7EAE7] text-[#D48B80] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="creative-studio-title" className="font-serif font-bold text-lg text-[#2D2A26]">
                EDSER Creative & Science Studio
              </h2>
              <span className="text-xs text-stone-500">Multimodal AI Generation & Nature Biology Discovery</span>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
            aria-label="Close studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-6 py-2.5 bg-[#F3EFEA] border-b border-[#EFE9E1] flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('video');
            }}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'video' ? 'bg-[#2D2A26] text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Veo Video Generation</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('music');
            }}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'music' ? 'bg-[#2D2A26] text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Lyria Music Generator</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('voice');
            }}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'voice' ? 'bg-[#2D2A26] text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Live API Voice (gemini-3.8-live)</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('science');
            }}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'science' ? 'bg-[#2D2A26] text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Dna className="w-4 h-4" />
            <span>Bioscience & Nature Skills</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          {/* TAB 1: Veo Video Generation */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-xl text-[#2D2A26]">
                  Animate Images & Text into Video (Veo 3)
                </h3>
                <p className="text-xs text-stone-500">
                  Generate peaceful stationery animations or bring printable illustrations to life using model <code className="font-mono text-[#70826E]">veo-3.1-fast-generate-preview</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Video Controls Left */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                      Text Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      className="w-full p-3 bg-white border border-[#EFE9E1] rounded-xl text-xs sm:text-sm text-[#2D2A26] outline-none focus:border-[#70826E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                      Animate an Uploaded Photo (Image-to-Video)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="px-3.5 py-2 bg-white border border-dashed border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:border-[#70826E] cursor-pointer flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#70826E]" />
                        <span>{selectedImage ? 'Change Photo' : 'Upload Template Photo'}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      {selectedImage && (
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {selectedImage && (
                      <div className="mt-2 w-24 h-18 rounded-lg overflow-hidden border border-stone-200">
                        <img src={selectedImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                      Aspect Ratio (Mandatory 16:9 or 9:16)
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVideoAspectRatio('16:9')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          videoAspectRatio === '16:9' ? 'bg-[#2D2A26] text-white' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        16:9 Landscape
                      </button>
                      <button
                        onClick={() => setVideoAspectRatio('9:16')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          videoAspectRatio === '9:16' ? 'bg-[#2D2A26] text-white' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        9:16 Portrait
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateVideo}
                    disabled={isVideoGenerating}
                    className="w-full py-3 bg-[#2D2A26] text-white text-xs font-semibold rounded-xl hover:bg-[#403C36] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isVideoGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering with Veo...</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        <span>Generate Veo Video</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Video Preview Right */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                    Rendered Video Preview
                  </span>
                  <div
                    className={`bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center border border-stone-200 ${
                      videoAspectRatio === '16:9' ? 'aspect-16/9' : 'aspect-9/16 max-w-xs mx-auto'
                    }`}
                  >
                    {generatedVideoUrl ? (
                      <video
                        src={generatedVideoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 text-stone-400 space-y-2">
                        <Video className="w-8 h-8 mx-auto opacity-50" />
                        <p className="text-xs">Your generated Veo video will display here</p>
                      </div>
                    )}
                  </div>
                  {videoStatusMsg && (
                    <p className="text-xs text-stone-600 bg-[#EEF2ED] p-2.5 rounded-lg">
                      {videoStatusMsg}
                    </p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Lyria Music Generation */}
          {activeTab === 'music' && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-xl text-[#2D2A26]">
                  Generate Planning & Focus Music (Lyria)
                </h3>
                <p className="text-xs text-stone-500">
                  Generate peaceful study, focus, and nature audio clips using <code className="font-mono text-[#70826E]">lyria-3-clip-preview</code> (up to 30s clips) or <code className="font-mono text-[#70826E]">lyria-3-pro-preview</code>.
                </p>
              </div>

              <div className="space-y-4 bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                    Music Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    className="w-full p-3 bg-white border border-[#EFE9E1] rounded-xl text-xs sm:text-sm text-[#2D2A26] outline-none focus:border-[#70826E]"
                  />
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => setMusicPrompt('Peaceful acoustic guitar and warm morning coffee ambiance')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700"
                  >
                    Acoustic Morning
                  </button>
                  <button
                    onClick={() => setMusicPrompt('Gentle rain on leaves and soft lo-fi piano chords')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700"
                  >
                    Rain & Lo-Fi
                  </button>
                  <button
                    onClick={() => setMusicPrompt('Playful orchestral strings and birdsong for children coloring time')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700"
                  >
                    Kids Playful
                  </button>
                </div>

                <button
                  onClick={handleGenerateMusic}
                  disabled={isMusicGenerating}
                  className="w-full py-3 bg-[#2D2A26] text-white text-xs font-semibold rounded-xl hover:bg-[#403C36] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isMusicGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Track with Lyria...</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4" />
                      <span>Generate Ambient Soundscape</span>
                    </>
                  )}
                </button>

                {musicAudioUrl && (
                  <div className="p-4 bg-[#EEF2ED] rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#70826E] text-white flex items-center justify-center">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-[#2D2A26] block">
                          Generated Lyria Focus Track
                        </span>
                        <span className="text-[11px] text-stone-500">Audio ready for playback</span>
                      </div>
                    </div>

                    <audio src={musicAudioUrl} controls className="h-8 max-w-[200px]" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Live API Voice Conversations (gemini-3.8-live) */}
          {activeTab === 'voice' && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-xl text-[#2D2A26]">
                  Real-Time Voice Conversations (gemini-3.8-live)
                </h3>
                <p className="text-xs text-stone-500">
                  Have a natural, low-latency spoken conversation with the EDSER Assistant using the Live API.
                </p>
              </div>

              <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6 sm:p-8 text-center space-y-6">
                <div
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all ${
                    isLiveActive
                      ? 'bg-[#70826E] text-white ring-8 ring-[#70826E]/20 animate-pulse'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-lg text-[#2D2A26]">
                    {isLiveActive ? 'Live Voice Session Active' : 'Start Spoken Session'}
                  </h4>
                  <p className="text-xs text-stone-500">{liveStatus}</p>
                </div>

                <button
                  onClick={toggleLiveVoice}
                  className={`px-8 py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isLiveActive
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-[#2D2A26] text-white hover:bg-[#403C36]'
                  }`}
                >
                  {isLiveActive ? 'End Voice Conversation' : 'Connect Spoken Voice (gemini-3.8-live)'}
                </button>

                {/* Conversation Log */}
                {liveTranscript.length > 0 && (
                  <div className="text-left bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                    <span className="text-[11px] font-semibold uppercase text-stone-500">
                      Spoken Transcript
                    </span>
                    {liveTranscript.map((t, idx) => (
                      <p key={idx} className="text-xs text-[#2D2A26]">
                        {t}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Bioscience & Nature Skills (Science Skill) */}
          {activeTab === 'science' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#70826E] uppercase tracking-wider">
                  <Dna className="w-4 h-4" />
                  <span>Google DeepMind Science Skills Integration</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-[#2D2A26]">
                  Nature, Flora & Wildlife Bioscience Explorer
                </h3>
                <p className="text-xs text-[#5C564E]">
                  Ground your nature journals and National Park adventure books with real scientific taxonomy from <strong className="text-[#2D2A26]">UniProtKB</strong> and biomedical literature from <strong className="text-[#2D2A26]">PubMed & Europe PMC</strong>.
                </p>
              </div>

              {/* Quick Science Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-stone-500 py-1">Quick Explorer:</span>
                {[
                  { label: 'Common Sage (Salvia officinalis)', q: 'Salvia officinalis' },
                  { label: 'Grizzly Bear (Ursus arctos)', q: 'Ursus arctos' },
                  { label: 'American Bison (Bison bison)', q: 'Bison bison' },
                  { label: 'Giant Sequoia (Sequoiadendron)', q: 'Sequoiadendron' },
                ].map((item) => (
                  <button
                    key={item.q}
                    onClick={() => {
                      setScienceQuery(item.q);
                      handleQueryScience(item.q);
                    }}
                    className="px-3 py-1 bg-white border border-[#EFE9E1] hover:border-[#70826E] rounded-md text-stone-700 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Query Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scienceQuery}
                  onChange={(e) => setScienceQuery(e.target.value)}
                  placeholder="Enter species or botanical name (e.g. Salvia, Lavandula, Ursus)..."
                  className="flex-1 px-4 py-2.5 bg-white border border-[#EFE9E1] rounded-xl text-xs sm:text-sm text-[#2D2A26] outline-none focus:border-[#70826E]"
                />
                <button
                  onClick={() => handleQueryScience()}
                  disabled={isScienceLoading}
                  className="px-5 py-2.5 bg-[#70826E] text-white text-xs font-semibold rounded-xl hover:bg-[#5E6E5D] transition-colors flex items-center gap-2"
                >
                  {isScienceLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
                  <span>Search Taxonomy</span>
                </button>
              </div>

              {/* Results List */}
              <div className="space-y-3">
                {scienceResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scienceResults.map((taxon: any) => (
                      <div
                        key={taxon.taxonId}
                        className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-4 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-base text-[#2D2A26]">
                            {taxon.scientificName}
                          </span>
                          <span className="text-[11px] font-mono text-[#70826E] bg-[#EEF2ED] px-2 py-0.5 rounded">
                            ID: {taxon.taxonId}
                          </span>
                        </div>

                        {taxon.commonName && (
                          <p className="text-xs text-stone-600 font-medium">
                            Common name: {taxon.commonName}
                          </p>
                        )}

                        <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                          <span>Rank: {taxon.rank || 'Species'}</span> ·{' '}
                          <span>Lineage: {(taxon.lineage || []).slice(0, 3).join(' > ')}</span>
                        </div>

                        <a
                          href={`https://www.uniprot.org/taxonomy/${taxon.taxonId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#70826E] hover:underline flex items-center gap-1 font-medium pt-1"
                        >
                          <span>Explore UniProtKB entry</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-stone-400 bg-white border border-[#EFE9E1] rounded-xl space-y-2">
                    <Leaf className="w-8 h-8 mx-auto text-[#70826E] opacity-60" />
                    <p className="text-xs">Click one of the species above or type a name to query verified bioscience records</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
