import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { Servicio, Categoria } from '@models/index';
import { BusinessCardComponent } from '@features/home/components/business-card/business-card';
import { LoadingComponent } from '@shared/components/loading/loading';

/**
 * Home page component displaying the service catalog.
 *
 * Provides functionality for:
 * - Displaying all available services as cards
 * - Filtering by category
 * - Searching by service name
 * - Showing service counts per category
 *
 * @remarks
 * - Loads services and categories from API on initialization
 * - Uses reactive forms for search and category filtering
 * - Filters are applied in real-time via computed properties
 * - Only displays active services (estadoServicio = true)
 *
 * @selector app-home-page
 *
 * @see {@link ApiService.getServices}
 * @see {@link BusinessCardComponent}
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  imports: [ReactiveFormsModule, BusinessCardComponent, LoadingComponent],
})
export class HomePageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  // Reactive Form
  protected readonly searchForm = this.fb.group({
    searchBusiness: [''],
    selectedCategorie: [0],
  });

  // Getters for form values
  protected get currentCategory(): number {
    return this.searchForm.get('selectedCategorie')!.value ?? 0;
  }

  protected get currentSearch(): string {
    return this.searchForm.get('searchBusiness')!.value ?? '';
  }

  protected readonly categories = signal<Categoria[]>([]);
  protected readonly business = signal<Servicio[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  /**
   * Filters services by selected category and search text.
   *
   * @returns Array of services matching current filters
   *
   * @remarks
   * **Filter logic:**
   * - Category: 0 = all, otherwise filters by categoriaServicio
   * - Search: case-insensitive substring match on nombreServicio
   * - Both filters are applied simultaneously (AND logic)
   */
  protected filteredBusiness(): Servicio[] {
    const currentCategory = this.currentCategory;
    const currentSearch = this.currentSearch.toLowerCase();

    return this.business().filter((s) => {
      const matchCategorie = currentCategory === 0 || s.categoriaServicio === currentCategory;
      const matchSearch = !currentSearch || s.nombreServicio.toLowerCase().includes(currentSearch);
      return matchCategorie && matchSearch;
    });
  }

  ngOnInit(): void {
    this.loadServicios();
  }

  protected loadServicios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getServices().subscribe({
      next: (response) => {
        if (response.success) {
          this.business.set(response.data.servicios);
          this.categories.set(response.data.categorias);
        } else {
          this.error.set('No se pudieron cargar los servicios');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al conectar con el servidor');
        this.loading.set(false);
      },
    });
  }

  /**
   * Counts active services for a specific category.
   *
   * @param categorie - Category to count services for
   * @returns Number of active services in the category matching current search
   *
   * @remarks
   * Only counts services where estadoServicio = true.
   * Respects current search filter.
   */
  protected countByCategory(categorie: Categoria): number {
    const currentSearch = this.currentSearch.toLowerCase();

    return this.business().filter((s) => {
      const matchCategorie = categorie.codigoCategoria === 0 || s.categoriaServicio === categorie.codigoCategoria;
      const matchSearch = !currentSearch || s.nombreServicio.toLowerCase().includes(currentSearch);
      const statusBusiness = s.estadoServicio;
      return matchCategorie && matchSearch && statusBusiness;
    }).length;
  }

  protected clearSearch(): void {
    this.searchForm.patchValue({ searchBusiness: '' });
  }

  protected onCategoryChange(value: number): void {
    this.searchForm.patchValue({ selectedCategorie: value });
  }
}
