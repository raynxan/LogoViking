import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  useSetUserPassword,
  useDisconnectGoogle,
  getGetCurrentUserQueryKey,
  type User,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type AccountSecurityCardProps = {
  user: User;
};

export function AccountSecurityCard({ user }: AccountSecurityCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const setPassword = useSetUserPassword();
  const disconnectGoogle = useDisconnectGoogle();

  const hasPassword = user.hasPassword === true;
  const hasGoogle = user.hasGoogle === true;

  const [showForm, setShowForm] = useState(!hasPassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const refetchUser = () =>
    queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Use at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Re-enter the same password in both fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await setPassword.mutateAsync({
        data: {
          newPassword,
          ...(hasPassword ? { currentPassword } : {}),
        },
      });
      toast({
        title: hasPassword ? "Password updated" : "Password set",
        description:
          result?.message ??
          (hasPassword
            ? "You can sign in with your new password."
            : "You can now sign in with your email and password."),
      });
      resetForm();
      setShowForm(false);
      refetchUser();
    } catch (err) {
      const message =
        (err as { message?: string })?.message ?? "Try again in a moment.";
      toast({
        title: hasPassword ? "Couldn't update password" : "Couldn't set password",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnectGoogle = async () => {
    if (
      !window.confirm(
        "Disconnect your Google account? You'll need to sign in with your email and password from now on.",
      )
    ) {
      return;
    }
    try {
      const result = await disconnectGoogle.mutateAsync();
      toast({
        title: "Google disconnected",
        description: result?.message ?? "Your Google account has been unlinked.",
      });
      refetchUser();
    } catch (err) {
      const message =
        (err as { message?: string })?.message ?? "Try again in a moment.";
      toast({
        title: "Couldn't disconnect Google",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-12" data-testid="card-account-security">
      <CardHeader>
        <CardTitle>Account security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Password</span>
              <Badge
                variant={hasPassword ? "default" : "secondary"}
                data-testid="badge-password-status"
              >
                {hasPassword ? "Set" : "Not set"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {hasPassword
                ? "You can sign in with your email and password."
                : "Add a password so you can sign in even if you lose access to your Google account."}
            </p>
          </div>
          {hasPassword && !showForm && (
            <Button
              variant="outline"
              onClick={() => setShowForm(true)}
              data-testid="button-change-password"
            >
              Change password
            </Button>
          )}
          {!hasPassword && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              data-testid="button-set-password"
            >
              Set password
            </Button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-4">
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  data-testid="input-current-password"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                data-testid="input-new-password"
              />
              <p className="text-xs text-muted-foreground">At least 6 characters.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                data-testid="input-confirm-password"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={setPassword.isPending}
                data-testid="button-submit-password"
              >
                {setPassword.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : hasPassword ? (
                  "Update password"
                ) : (
                  "Save password"
                )}
              </Button>
              {hasPassword && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  disabled={setPassword.isPending}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}

        {hasGoogle && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-border pt-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Google sign-in</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                {hasPassword
                  ? "You can also sign in with Google. Disconnect to remove this option."
                  : "Set a password first before disconnecting your Google account."}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnectGoogle}
              disabled={!hasPassword || disconnectGoogle.isPending}
              data-testid="button-disconnect-google"
            >
              {disconnectGoogle.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disconnecting…
                </>
              ) : (
                "Disconnect Google"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
