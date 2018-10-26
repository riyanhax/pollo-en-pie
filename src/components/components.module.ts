import { NgModule } from '@angular/core';
import { DpHeaderComponent } from './dp-header/dp-header';
import { ButtonSearchComponent } from './button-search/button-search';
@NgModule({
	declarations: [DpHeaderComponent,
    ButtonSearchComponent],
	imports: [],
	exports: [DpHeaderComponent,
    ButtonSearchComponent]
})
export class ComponentsModule {}
