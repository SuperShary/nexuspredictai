import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Trash2,
  RefreshCw,
  Database,
  Bell,
  Palette,
  Download,
  Upload,
  Shield
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
  const [showClearDialog, setShowClearDialog] = useState(false);

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
          
          <DropdownMenuItem 
            onClick={handleThemeSettings}
            className="flex items-center space-x-3 cursor-pointer hover:bg-accent/20"
          >
            <Palette className="w-4 h-4 text-ai-secondary" />
            <span>Appearance</span>
          </DropdownMenuItem>
          
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
    </>
  );
};