export default {
  menusVisible(name: string) {
    const menus = sessionStorage.getItem('role_menus');

    if (menus !== null)
      if (!menus.includes(name)) {
        return false;
      } else {
        return true;
      }
  },
};
