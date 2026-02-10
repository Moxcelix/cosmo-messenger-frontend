import { useLogoutRedirect } from "../hooks/useLogoutRedirect";
import { UserAccount } from "../widgets/UserAccount.widget";

export const ProfilePage = () => {
    const { loading } = useLogoutRedirect('/new/login');
    
    return (
        <div>
            <h1>Профиль</h1>
            <UserAccount />
        </div>
    );
}