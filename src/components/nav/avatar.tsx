
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useSession } from "next-auth/react";
interface AvatarProps {
    className?: string;
}
const AvatarComponent: React.FC<AvatarProps> = ({ className }) => {
    const { data: session } = useSession();
    return (
        <Avatar className={className}>
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
    );
};

export default AvatarComponent;