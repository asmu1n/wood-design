import { createStore } from '@/lib/createStore';

export interface UserInfo {
    id: User['id'];
    name: User['name'];
    email: User['email'];
    roles: User['roles'];
    avatar?: User['image'];
}

const { useStore: useUserInfo, StoreProvider: UserInfoProvider } = createStore<UserInfo>(() => {
    return {
        id: '',
        name: '',
        email: '',
        roles: [],
        avatar: ''
    };
});

export { useUserInfo, UserInfoProvider };
