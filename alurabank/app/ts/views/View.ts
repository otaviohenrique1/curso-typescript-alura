import { logarTempoDeExecucao } from '../helpers/decorators/index';

export abstract class View<T> {
    /* T -> tipo generico */
    // protected _elemento: Element;
    protected _elemento: JQuery;
    private _escapar: boolean; /* retira a tag script do template */

    constructor(seletor: string, escapar: boolean = true) {
        // this._elemento = document.querySelector(seletor);
        this._elemento = $(seletor);
        this._escapar = escapar;
    }

    @logarTempoDeExecucao()
    update(model: T): void {
        let template = this.template(model);
        if(this._escapar) {
            template = template.replace(/<script>[\s\S]*?<\/script>/, '');
        }

        // this._elemento.innerHTML = this.template(model);
        // this._elemento.html(this.template(model));
        this._elemento.html(template);
    }

    abstract template(model: T): string;
}