import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactCard } from './components/contact-card/contact-card';
import { Contacto } from '@core/models/contacto.model';

@Component({
  selector: 'app-contacts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContactCard, NgOptimizedImage],
  templateUrl: './contacts.html',
})
export class ContactsComponent {
  protected readonly contacts: Contacto[] = [
    {
      nombre: 'Gustavo Peña',
      cargo: 'Gerente General',
      telefono: '+591 6 925 0050',
      correo: 'gustavo.pena@qentra.com',
      color: 'blue',
      iniciales: 'GP',
    },
    {
      nombre: 'Nyder Garcia',
      cargo: 'Encargado Nacional',
      telefono: '+591 6 206 2006',
      correo: 'nayder.garcia@qentra.com',
      color: 'green',
      iniciales: 'NG',
    },
    {
      nombre: 'Carlos Castillo',
      cargo: 'Gerente de Sistemas',
      telefono: '+591 6 923 3354',
      correo: 'carlos.castillo@qentra.com',
      color: 'orange',
      iniciales: 'CC',
    },
  ];
}
