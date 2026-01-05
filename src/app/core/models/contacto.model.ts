/**
 * Contact information for support personnel.
 *
 * @remarks
 * Used in the contacts page to display support team members.
 */
export interface Contacto {
  /**
   * Full name of the contact person.
   */
  nombre: string;

  /**
   * Job title or position.
   *
   * @example "Gerente de Operaciones"
   */
  cargo: string;

  /**
   * Phone number.
   *
   * @example "71234567"
   */
  telefono: string;

  /**
   * Email address.
   *
   * @example "contacto@example.com"
   */
  correo: string;

  /**
   * Avatar color theme.
   */
  color: 'blue' | 'green' | 'orange';

  /**
   * Initials for avatar display.
   *
   * @example "JD"
   */
  iniciales: string;
}
