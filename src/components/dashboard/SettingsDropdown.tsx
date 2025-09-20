import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import {
  Settings,
  Trash2,
  RefreshCw,
  Database,
  Bell,
  Palette,
  Download,
  Upload,
  Shield,
  Moon,
  Sun,
  Monitor,
  Zap,
  ExternalLink
} from "lucide-react";

interface SettingsDropdownProps {
  onClearTable?: () => void;
  onResetFilters?: () => void;
  onExportData?: () => void;
}

export const SettingsDropdown = ({ 
  onClearTable, 
  onResetFilters, 
  onExportData 
}: SettingsDropdownProps) => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showWebflowDialog, setShowWebflowDialog] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClearTable = () => {
    if (onClearTable) {
      onClearTable();
      toast({
        title: "Table Cleared",
        description: "All table data has been cleared successfully.",
        className: "neon-glow-cyan",
      });
    }
    setShowClearDialog(false);
  };

  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
      toast({
        title: "Filters Reset",
        description: "All filters have been reset to default values.",
        className: "neon-glow-success",
      });
    }
  };

  const handleExportData = () => {
    if (onExportData) {
      onExportData();
      toast({
        title: "Export Started",
        description: "Your data export is being prepared...",
        className: "neon-glow-purple",
      });
    }
  };

  const handleNotificationSettings = () => {
    toast({
      title: "Notification Center",
      description: "Opening notification settings...",
      className: "neon-glow-cyan",
    });
  };

  const handleThemeSettings = () => {
    toast({
      title: "Theme Settings",
      description: "Theme customization coming soon...",
      className: "neon-glow-purple",
    });
  };

  const handleSecuritySettings = () => {
    toast({
      title: "Security Center",
      description: "Opening security settings...",
      className: "neon-glow-danger",
    });
  };

  const handleTriggerWebflow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Webflow webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Triggering Webflow webhook:", webhookUrl);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          source: "Nexus Predict AI",
        }),
      });

      toast({
        title: "Webflow Triggered",
        description: "The request was sent to Webflow. Check your site for updates.",
        className: "neon-glow-success",
      });
      setShowWebflowDialog(false);
      setWebhookUrl("");
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Webflow webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light": return <Sun className="w-4 h-4" />;
      case "dark": return <Moon className="w-4 h-4" />;
      case "system": return <Monitor className="w-4 h-4" />;
      default: return <Moon className="w-4 h-4" />;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="glass-panel hover:neon-glow-purple"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="glass-card min-w-[220px] mr-4" 
          align="end"
        >
          <DropdownMenuLabel className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="terminal-text">System Settings</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Data Management */}
          <DropdownMenuItem 
            onClick={handleResetFilters}
            className="flex items-center space-x-3 cursor-pointer hover:bg-accent/20"
          >
            <RefreshCw className="w-4 h-4 text-ai-success" />
            <span>Reset Filters</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowClearDialog(true)}
            className="flex items-center space-x-3 cursor-pointer hover:bg-destructive/20"
          >
            <Trash2 className="w-4 h-4 text-ai-danger" />
            <span>Clear Table Data</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Webflow Integration */}
          <DropdownMenuItem 
            onClick={() => setShowWebflowDialog(true)}
            className="flex items-center space-x-3 cursor-pointer hover:bg-accent/20"
          >
            <Zap className="w-4 h-4 text-ai-primary" />
            <span>Trigger Webflow</span>
          </DropdownMenuItem>
          
          {/* Import/Export */}
          <DropdownMenuItem 
            onClick={handleExportData}
            className="flex items-center space-x-3 cursor-pointer hover:bg-accent/20"
          >
            <Download className="w-4 h-4 text-ai-primary" />
            <span>Export Data</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            disabled
            className="flex items-center space-x-3 opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>Import Data</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* System Settings */}
          <DropdownMenuItem 
            onClick={handleNotificationSettings}
            className="flex items-center space-x-3 cursor-pointer hover:bg-accent/20"
          >
            <Bell className="w-4 h-4 text-ai-warning" />
            <span>Notifications</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSecuritySettings}
            className="flex items-center space-x-3 cursor-pointer hover:bg-accent/20"
          >
            <Shield className="w-4 h-4 text-ai-danger" />
            <span>Security</span>
          </DropdownMenuItem>
          
          {/* Theme Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center space-x-3 cursor-pointer hover:bg-accent/20">
              {getThemeIcon()}
              <span>Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="glass-card">
              <DropdownMenuItem 
                onClick={() => setTheme("dark")}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("light")}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("system")}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            disabled
            className="flex items-center space-x-3 opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>Database Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              <span>Clear Table Data</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will clear all student data from the table. This action cannot be undone. 
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-panel">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearTable}
              className="bg-destructive hover:bg-destructive/80"
            >
              Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Webflow Integration Dialog */}
      <Dialog open={showWebflowDialog} onOpenChange={setShowWebflowDialog}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Trigger Webflow</span>
            </DialogTitle>
            <DialogDescription>
              Enter your Webflow webhook URL to trigger site updates or automations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTriggerWebflow} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://hooks.webflow.com/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="glass-panel"
                required
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowWebflowDialog(false)}
                className="glass-panel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="gradient-primary"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Triggering...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Trigger Webflow
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};