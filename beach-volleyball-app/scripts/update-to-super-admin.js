// 現在のデモユーザーをSuper Adminに更新するスクリプト
// ブラウザのコンソールで実行してください

const updateToSuperAdmin = () => {
  const demoUserData = localStorage.getItem('demo_user');
  
  if (demoUserData) {
    const userData = JSON.parse(demoUserData);
    
    // Super Admin権限に更新
    userData.role = 'super_admin';
    userData.isAdmin = true;
    userData.isOrganizer = true;
    userData.canCreateEvents = true;
    
    // 保存
    localStorage.setItem('demo_user', JSON.stringify(userData));
    
    console.log('✅ Super Adminに更新しました！');
    console.log('更新後のユーザー情報:', userData);
    
    // ページをリロード
    location.reload();
  } else {
    console.error('❌ デモユーザーが見つかりません。ログインしてください。');
  }
};

// 自動実行
updateToSuperAdmin();