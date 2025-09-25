import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Lightbulb, Code, RotateCcw, ChevronDown, Settings, Loader2, RefreshCw, ExternalLink, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePersistState } from '@/hooks/use-persist-state';
import { apiService } from '@/services/api';
import { ProblemData } from '@/types/extension';

interface Hint {
  id: number;
  content: string;
  revealed: boolean;
}

interface PseudoCode {
  content: string;
  revealed: boolean;
}

export function ExtensionPopup() {
  // Persistent states that should survive popup close
  const [problemText, setProblemText] = usePersistState('sb_problemText', '');
  const [extractedProblem, setExtractedProblem] = usePersistState<ProblemData | null>('sb_extractedProblem', null);
  const [hints, setHints] = usePersistState<Hint[]>('sb_hints', []);
  const [pseudoCode, setPseudoCode] = usePersistState<PseudoCode>('sb_pseudoCode', { content: '', revealed: false });
  const [currentHintIndex, setCurrentHintIndex] = usePersistState('sb_currentHintIndex', 0);
  const [hintsRemaining, setHintsRemaining] = usePersistState<number | null>('sb_hintsRemaining', null);
  const [isPseudoCodeOpen, setIsPseudoCodeOpen] = usePersistState('sb_isPseudoCodeOpen', false);

  // Non-persistent states (UI states that don't need to survive popup close)
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  // Auto-extract problem from current tab
  useEffect(() => {
    extractProblemFromTab();
  }, []);

  const extractProblemFromTab = async () => {
    try {
      setIsExtracting(true);
      
      // Check if we're in a browser extension environment
      if (typeof window !== 'undefined' && (window as any).chrome && (window as any).chrome.runtime) {
        const chrome = (window as any).chrome;
        // First check storage for recently extracted problem
        chrome.storage.session.get(['currentProblem'], (result: any) => {
          if (result.currentProblem) {
            setExtractedProblem(result.currentProblem);
            setProblemText(formatProblemText(result.currentProblem));
          }
        });

        // Request fresh extraction from current tab
        chrome.runtime.sendMessage({ type: 'MANUAL_EXTRACT' }, (response: any) => {
          if (response) {
            setExtractedProblem(response);
            setProblemText(formatProblemText(response));
            toast({
              title: "Problem extracted!",
              description: `Found "${response.title}" from ${response.platform}`,
              variant: "default"
            });
          }
        });
      } else {
        // Fallback for development/web mode
        const sampleProblem = {
          platform: 'Sample',
          url: window.location.href,
          title: 'Two Sum',
          description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
          difficulty: 'Easy',
          tags: ['Array', 'Hash Table'],
          extractedAt: new Date().toISOString()
        } as ProblemData;
        
        setExtractedProblem(sampleProblem);
        setProblemText(formatProblemText(sampleProblem));
      }
    } catch (error) {
      console.error('Error extracting problem:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const formatProblemText = (problem: ProblemData): string => {
    return `Platform: ${problem.platform}
Title: ${problem.title}
${problem.difficulty ? `Difficulty: ${problem.difficulty}` : ''}
${problem.tags && problem.tags.length > 0 ? `Tags: ${problem.tags.join(', ')}` : ''}

${problem.description}`;
  };


  const getNextHint = async () => {
    if (currentHintIndex >= 5) {
      toast({
        title: "All hints revealed!",
        description: "You've seen all available hints. Try implementing the solution!",
        variant: "default"
      });
      return;
    }

    if (!extractedProblem) {
      toast({
        title: "No problem found",
        description: "Please extract a problem first or enter one manually.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingHint(true);
    try {
      const response = await apiService.getHint(extractedProblem, currentHintIndex);
      
      if (response.success && response.hint) {
        const newHint: Hint = {
          id: currentHintIndex + 1,
          content: response.hint,
          revealed: true
        };
        
        const updatedHints = [...hints, newHint];
        setHints(updatedHints);
        setCurrentHintIndex(currentHintIndex + 1);
        setHintsRemaining(response.hintsRemaining ?? null);
        
        toast({
          title: `Hint ${currentHintIndex + 1} revealed!`,
          description: response.hintsRemaining > 0 
            ? `${response.hintsRemaining} more hints available!` 
            : "Keep thinking, you're on the right track!",
          variant: "default"
        });
      } else {
        throw new Error(response.error || 'Failed to get hint');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get hint. Please check your API configuration.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHint(false);
    }
  };

  const revealPseudoCode = async () => {
    if (pseudoCode.revealed) {
      setIsPseudoCodeOpen(!isPseudoCodeOpen);
      return;
    }

    if (!extractedProblem) {
      toast({
        title: "No problem found",
        description: "Please extract a problem first or enter one manually.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingCode(true);
    try {
      const response = await apiService.getPseudoCode(extractedProblem);
      
      if (response.success && response.pseudoCode) {
        setPseudoCode({ content: response.pseudoCode, revealed: true });
        setIsPseudoCodeOpen(true);
        
        toast({
          title: "Pseudo code revealed!",
          description: "Use this as a guide to implement your solution.",
          variant: "default"
        });
      } else {
        throw new Error(response.error || 'Failed to get pseudo code');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get pseudo code. Please check your API configuration.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCode(false);
    }
  };

  const resetSession = () => {
    // Clear all persistent states
    setHints([]);
    setPseudoCode({ content: '', revealed: false });
    setCurrentHintIndex(0);
    setHintsRemaining(null);
    setIsPseudoCodeOpen(false);
    setProblemText('');
    setExtractedProblem(null);
    toast({
      title: "Session reset",
      description: "Ready for a fresh start!",
      variant: "default"
    });
  };

  return (
    <div className="extension-popup bg-background border border-border rounded-none">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-extension-primary rounded-full flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-extension-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg">Student Buddy</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '#/settings'}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Problem Extraction Status */}
        {extractedProblem && (
          <div className="px-4 pt-4">
            <Card className="bg-muted/30 border-extension-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-extension-primary" />
                    <span className="text-sm font-medium">Auto-extracted from {extractedProblem.platform}</span>
                    <Badge variant="secondary" className="text-xs">{extractedProblem.difficulty}</Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={extractProblemFromTab}
                    disabled={isExtracting}
                  >
                    {isExtracting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{extractedProblem.title}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Problem Text Area */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Problem Statement</label>
              {!extractedProblem && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={extractProblemFromTab}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <ExternalLink className="w-3 h-3 mr-1" />
                  )}
                  Extract
                </Button>
              )}
            </div>
            <Textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Paste your DSA problem here or click Extract to auto-fill from the current tab..."
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={getNextHint}
              disabled={isLoadingHint || !problemText.trim()}
              className="flex-1"
              variant="default"
            >
              {isLoadingHint ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lightbulb className="w-4 h-4 mr-2" />
              )}
              Get Hint {currentHintIndex > 0 && `(${currentHintIndex}/5)`}
            </Button>
            
            <Button 
              onClick={revealPseudoCode}
              disabled={isLoadingCode || !problemText.trim()}
              variant="secondary"
              className="flex-1"
            >
              {isLoadingCode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Code className="w-4 h-4 mr-2" />
              )}
              {pseudoCode.revealed ? 'View Code' : 'Reveal Code'}
            </Button>
            
            <Button 
              onClick={resetSession}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Hints Section */}
        {hints.length > 0 && (
          <div className="px-4 pb-4 space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-extension-primary" />
              Progressive Hints
            </h3>
            <div className="space-y-2">
              {hints.map((hint, index) => (
                <Card key={hint.id} className="hint-reveal bg-hint-bg border-hint-border">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs mt-0.5">
                        Hint {index + 1}
                      </Badge>
                      <p className="text-sm leading-relaxed flex-1">{hint.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pseudo Code Section */}
        {pseudoCode.revealed && (
          <div className="px-4 pb-4">
            <Collapsible open={isPseudoCodeOpen} onOpenChange={setIsPseudoCodeOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Code className="w-4 h-4 text-extension-primary" />
                    Pseudo Code Solution
                  </h3>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isPseudoCodeOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="code-reveal">
                <Card className="mt-2 bg-code-bg border-border">
                  <CardContent className="p-4">
                    <pre className="text-sm text-code-foreground whitespace-pre-wrap font-mono leading-relaxed">
                      {pseudoCode.content}
                    </pre>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Progress Footer */}
        <div className="mt-auto p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Hints used: {hints.length}/5</span>
            {hints.length < 5 && hintsRemaining !== null && hintsRemaining > 0 && (
              <span>{hintsRemaining} more hints available</span>
            )}
            <span className="flex items-center gap-1">
              {pseudoCode.revealed && <Badge variant="outline" className="text-xs">Code viewed</Badge>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}