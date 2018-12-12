import { NgModule } from '@angular/core';
import { DpHeaderComponent } from './dp-header/dp-header';
import { ButtonSearchComponent } from './button-search/button-search';
import { ProgressBarComponent } from './progress-bar/progress-bar';
@NgModule({
	declarations: [DpHeaderComponent,
    ButtonSearchComponent,
    ProgressBarComponent],
	imports: [],
	exports: [DpHeaderComponent,
    ButtonSearchComponent,
    ProgressBarComponent]
})
export class ComponentsModule {}
