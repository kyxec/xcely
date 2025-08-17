import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthErrorAlertProps {
    message: string;
}

export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
    return (
        <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}