import { NegociacoesView, MensagemView } from '../views/index';
import { Negociacoes, Negociacao } from '../models/index';
import { domInject, throttle } from '../helpers/decorators/index';
import { NegociacaoParcial } from '../models/index';
import { NegociacaoService/* , HandleFunction */ } from '../services/index';
import { imprime } from '../helpers/index';

/*
import { NegociacoesView } from '../views/NegociacoesView';
import { MensagemView } from '../views/MensagemView';
import { Negociacoes } from '../models/Negociacoes';
import { Negociacao } from '../models/Negociacao';
*/

export class NegociacaoController {
    @domInject('#data')
    private _inputData: JQuery;

    @domInject('#quantidade')
    private _inputQuantidade: JQuery;
    
    @domInject('#valor')  
    private _inputValor: JQuery;

    /*
    private _inputData: HTMLInputElement;
    private _inputQuantidade: HTMLInputElement;
    private _inputValor: HTMLInputElement;
    */

    private _negociacoes = new Negociacoes();
    private _negociacoesView = new NegociacoesView("#negociacoesView");
    private _mensagemView = new MensagemView("#mensagemView");

    private _service = new NegociacaoService();

    constructor() {
        /*
        this._inputData = $('#data');
        this._inputQuantidade = $('#quantidade');
        this._inputValor = $('#valor');
        */

        /*
        this._inputData = <HTMLInputElement>document.querySelector('#data');
        this._inputQuantidade = <HTMLInputElement>document.querySelector('#quantidade');
        this._inputValor = <HTMLInputElement>document.querySelector('#valor');
        */

        this._negociacoesView.update(this._negociacoes);
    }

    /* adiciona(event: Event) {} */
    @throttle()    
    adiciona() {
        // event.preventDefault();

        let data = new Date(this._inputData.val().replace(/-/g, ','));

        if(!this._ehDiaUtil(data)) {
            this._mensagemView.update('Somente negociações em dias úteis, por favor!');
            return;
        }

        const negociacao = new Negociacao(
            data,
            parseInt(this._inputQuantidade.val()),
            parseFloat(this._inputValor.val())

            /*
            new Date(this._inputData.value.replace(/-/g, ',')),
            parseInt(this._inputQuantidade.value),
            parseFloat(this._inputValor.value)
            */
        );
        
        this._negociacoes.adiciona(negociacao);
        imprime(negociacao, this._negociacoes);
        this._negociacoesView.update(this._negociacoes);
        this._mensagemView.update('Negociação adicionada com sucesso!');
    }
    
    private _ehDiaUtil(data: Date) {
        return data.getDay() != DiaDaSemana.Sabado && data.getDay() != DiaDaSemana.Domingo;
    }

    
    @throttle()
    importaDados() {
        // const isOk: HandleFunction = (res: Response) => {
        //     if(res.ok) {
        //         return res;
        //     } else {
        //         throw new Error(res.statusText);
        //     }
        // }

        this._service
            .obterNegociacoes(res => {
                if(res.ok) {
                    return res;
                } else {
                    throw new Error(res.statusText);
                }
            })
            .then(negociacoesParaImportar => {
                const negociacoesJaImportadas = this._negociacoes.paraArray();

                negociacoesParaImportar
                    .filter(negociacao =>
                        !negociacoesJaImportadas.some( jaImportadas =>
                            negociacao.ehIgual(jaImportadas)))
                    .forEach(negociacao =>
                        this._negociacoes.adiciona(negociacao));
                
                this._negociacoesView.update(this._negociacoes);
            })
            .catch(err => this._mensagemView.update(err.message));

        // fetch('http://localhost:8080/dados')
        //     .then(res => isOk(res))
        //     .then(res => res.json())
        //     .then((dados: NegociacaoParcial[]) =>{
        //         dados
        //             .map(dado => new Negociacao(new Date(), dado.vezes, dado.montante))
        //             .forEach(Negociacao => this._negociacoes.adiciona(Negociacao));
        //         this._negociacoesView.update(this._negociacoes);
        //     })
        //     .catch(err => console.log(err.message));
    }
}

enum DiaDaSemana {
    Domingo,
    Segunda,
    Terca,
    Quarta,
    Quinta,
    Sexta,
    Sabado
}