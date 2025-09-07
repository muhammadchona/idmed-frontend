import api from '../apiService/apiService';

interface ApiPermission {
  hasAccess: boolean;
}

interface UiPermissionSection {
  [action: string]: boolean;
}

interface PermissionsResponse {
  permissions: { [url: string]: ApiPermission };
  uiPermissions: { [section: string]: UiPermissionSection };
  roles: string[];
}

class PermissionService {
  private apiPermissions: { [url: string]: ApiPermission } = {};
  private uiPermissions: { [section: string]: UiPermissionSection } = {};
  private userRoles: string[] = [];
  private isLoaded = false;

  private readonly STORAGE_KEY = 'user_permissions';

  constructor() {
    this.loadFromStorage();
  }

  async loadPermissions(): Promise<boolean> {
    try {
      const { data } = await api().get('/requestmap/getUserPermissions');
      this.apiPermissions = data.permissions;
      this.uiPermissions = data.uiPermissions;
      this.userRoles = data.roles;
      this.isLoaded = true;

      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          apiPermissions: this.apiPermissions,
          uiPermissions: this.uiPermissions,
          userRoles: this.userRoles,
        })
      );

      return true;
    } catch (error) {
      console.error('Failed to load permissions', error);
      return false;
    }
  }

  // Load permissions from localStorage
  private loadFromStorage(): void {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        this.apiPermissions = data.apiPermissions || {};
        this.uiPermissions = data.uiPermissions || {};
        this.userRoles = data.userRoles || [];
        this.isLoaded = true;
      } catch (e) {
        console.error('Error parsing stored permissions', e);
      }
    }
  }

  canPerformUiAction(section: string, action: string): boolean {
    if (!this.isLoaded) {
      // console.warn('Permissions not loaded yet');
      return false;
    }

    const sectionPermissions = this.uiPermissions[section];
    if (sectionPermissions && sectionPermissions[action] !== undefined) {
      return sectionPermissions[action];
    }
    return false;
  }

  canAccessApi(url: string): boolean {
    if (!this.isLoaded) {
      // console.warn('Permissions not loaded yet');
      return false;
    }

    // Exact match
    const exactPermission = this.apiPermissions[url];
    if (exactPermission) {
      return exactPermission.hasAccess;
    }

    // Wildcard match
    const wildcardMatches = Object.entries(this.apiPermissions)
      .filter(([pattern]) => pattern.includes('/**'))
      .some(([pattern, permInfo]) => {
        const basePath = pattern.replace('/**', '');
        return url.startsWith(basePath) && permInfo.hasAccess;
      });

    return wildcardMatches;
  }

  hasAnyRole(roles: string[]): boolean {
    return this.userRoles.some((userRole) => roles.includes(userRole));
  }
}

export default new PermissionService();
