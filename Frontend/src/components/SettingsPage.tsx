import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Moon, Sun, Save, Check, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface Settings {
  apiUrl: string;
  apiKey: string;
  aiMode: boolean;
  autoExtract: boolean;
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    apiUrl: '',
    apiKey: '',
    aiMode: true,
    autoExtract: true
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('student-buddy-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Load API settings from apiService
    const savedApiUrl = localStorage.getItem('apiUrl') || '';
    const savedApiKey = localStorage.getItem('apiKey') || '';
    setSettings(prev => ({ ...prev, apiUrl: savedApiUrl, apiKey: savedApiKey }));
  }, []);

  const saveSettings = () => {
    localStorage.setItem('student-buddy-settings', JSON.stringify(settings));
    
    // Update API service configuration
    apiService.updateConfig(settings.apiUrl, settings.apiKey);
    
    setIsSaved(true);
    toast({
      title: "Settings saved!",
      description: "Your preferences have been saved successfully.",
      variant: "default"
    });
    
    // Reset saved indicator after 2 seconds
    setTimeout(() => setIsSaved(false), 2000);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleTestConnection = async () => {
    if (!settings.apiUrl.trim()) {
      toast({
        title: "API URL required",
        description: "Please enter your backend API URL first.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Temporarily update config for testing
      apiService.updateConfig(settings.apiUrl, settings.apiKey);
      const isConnected = await apiService.testConnection();
      
      if (isConnected) {
        setConnectionStatus('success');
        toast({
          title: "Connection successful!",
          description: "Successfully connected to your backend API.",
          variant: "default"
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection failed",
          description: "Could not connect to the API. Check your URL and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.history.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your Student Buddy experience</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-extension-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-extension-primary" />
                )}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="text-sm font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Backend API Configuration
                {getConnectionIcon()}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure your backend API to get hints and pseudo-code for coding problems.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">API URL</Label>
                <Input
                  id="api-url"
                  type="url"
                  value={settings.apiUrl}
                  onChange={(e) => updateSetting('apiUrl', e.target.value)}
                  placeholder="http://localhost:3000/api"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The base URL of your backend API (e.g., http://localhost:3000/api)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key (Optional)</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => updateSetting('apiKey', e.target.value)}
                  placeholder="Enter your API key if required"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if your API doesn't require authentication
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !settings.apiUrl.trim()}
                  className="flex-1"
                >
                  {isTestingConnection ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feature Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-mode" className="text-sm font-medium">
                    AI-Powered Hints
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable AI-generated hints and explanations
                  </p>
                </div>
                <Switch
                  id="ai-mode"
                  checked={settings.aiMode}
                  onCheckedChange={(checked) => updateSetting('aiMode', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-extract" className="text-sm font-medium">
                    Auto-Extract Problems
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically detect and extract problem statements from coding platforms
                  </p>
                </div>
                <Switch
                  id="auto-extract"
                  checked={settings.autoExtract}
                  onCheckedChange={(checked) => updateSetting('autoExtract', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Backend API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Backend API Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <p>Your backend API should implement the following endpoints:</p>
                
                <div className="space-y-2 font-mono text-xs bg-muted p-3 rounded-md">
                  <div><strong>POST /api/hints</strong></div>
                  <div className="text-muted-foreground">Get progressive hints for a problem</div>
                  <div className="pl-4">Request: {`{ problem: {...}, hintIndex: number }`}</div>
                  <div className="pl-4">Response: {`{ hint: string, hintsRemaining: number }`}</div>
                </div>

                <div className="space-y-2 font-mono text-xs bg-muted p-3 rounded-md">
                  <div><strong>POST /api/pseudocode</strong></div>
                  <div className="text-muted-foreground">Get pseudo-code solution for a problem</div>
                  <div className="pl-4">Request: {`{ problem: {...} }`}</div>
                  <div className="pl-4">Response: {`{ pseudoCode: string }`}</div>
                </div>

                <div className="space-y-2 font-mono text-xs bg-muted p-3 rounded-md">
                  <div><strong>GET /api/health</strong></div>
                  <div className="text-muted-foreground">Health check endpoint</div>
                  <div className="pl-4">Response: 200 OK</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p><strong>Student Buddy Extension</strong></p>
                <p className="text-muted-foreground">Version 1.0.0</p>
                <p className="text-muted-foreground">
                  A Chrome extension to help students learn DSA with progressive hints and pseudo code.
                </p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  Report Issue
                </Button>
                <Button variant="outline" size="sm">
                  View Docs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button onClick={saveSettings} className="gap-2">
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}