var Tabellineiro

(function() {

    Tabellineiro = function (rootEl) {
        this.init = function () {
            console.info('Tabellineiro', 'init')
            this.dom = {}
            this.dom.rootEl = $(rootEl)
            this.dom.container = $('<div/>', {'class': 'container'})
                .appendTo(this.dom.rootEl)

            this.store = {
                num: null,
                player: null,
                answers: []
            }

            this.memory = []
            this.interval = null

            this.config = {
                // number of questions
                questionsNum: 3,
                // to have 10, maximum time for answer
                optimalSeconds: 7,
                // how much time influences the final vote
                coeff: 1,
                phrases: {
                    best: [
                        'Ottimo amigos!',
                        'Tu si che sei forte rapoide!',
                        'Yoooooooooooooooo molto bene!'
                    ],
                    veryGood: [
                        'Puoi migliorare, ma sei forte!',
                        'Ben fatto rapoide, ma studia ancora!',
                        'Dajjjeeeee ben fatto, ripassa ancora però che hai ancora segatura nella testa'
                    ],
                    good: [
                        'Andiamo bene, ma non benissimo',
                        'Si può fare di piuuuuuuuuu lalal lalal lalalallla, ma bravo'
                    ],
                    quiteGood: [
                        'Discretamente bene, ma la segatura si vede',
                        'Benino amigos, impegnati di più',
                        'Sei quasi bravo, studia!',
                    ],
                    suff: [
                        'Sei sufficiente amigos, ma la sufficienza non basta',
                        'forse non ti prendi un pugno sul naso, ma per poco',
                        'Studia ancora!',
                    ],
                    insuff: [
                        'Malino rapoides, studia!',
                        'Rapoide hai la segatura nel cervello?',
                        'Corri in camera a studiare!',
                    ],
                    quiteInsuff: [
                        'Calcio rotante in arrivo, occhio!',
                        'Hai un camion di segatura nel cervello?',
                        'Ristudia tutto subito!!!!',
                    ],
                    veryInsuff: [
                        'Pugno sul naso con rottura setto nasale in arrivo',
                        'C\'hai la segatura nel cervello?!',
                        'Uscite abolite, prossimo mese in camera a studiare!!',
                    ]
                }
            }
        };

        this.run = function () {
            console.info('Tabellineiro', 'run')
            this.stage0()

        }

        this.randomIntFromInterval = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min)
        }

        this.resetContainerDecorator = function (fn) {
           this.dom.container.empty();
           return fn.apply(this)
        }

        this.stage0 = function () {
            return this.resetContainerDecorator(function () {
                var tpl = `
                    <div class="row">
                    <div class="col-md-8">
                        <p><strong>Chi sei, testa di Rapoide?</strong></p>
                        <p><input class="form-control" type="string" id="rapoide-name" /></p>
                        <p><strong>Che tabellina macho?</strong></p>
                        <p><select id="choose-num" class="custom-select">
                            <option value=""></option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                        </select></p>
                `

                // last results
                var storage = localStorage.getItem('tabellineiro')
                storage = JSON.parse(storage)
                if(storage && storage.games.length) {
                    var games = storage.games
                    games.reverse()
                    tpl += `<h2>Precedenti risultati</h2>`
                    tpl += '<table class="table table-bordered table-striped">'
                    tpl += `<tr><th>Tabellina</th><th>Rapoide</th><th>Voto</th><th>Tempo totale</th></tr>`
                    for (var i = 0, l = Math.min(10, games.length - 1); i <= l; i++) {
                        var g = games[i]
                        tpl += `
                        <tr><td>${g.num}</td><td>${g.player}</td><td>${g.finalVote}</td><td>${g.totalSeconds} s</td></tr>
                        `
                    }
                    tpl += '</table>'
                }

                tpl += `
                </div>
                <div class="col-md-4">
                    <img src="http://arredoeconvivio.com/wp-content/uploads/2015/04/Massimo-Voghera-Testa-di-rapa.jpg" class="img-fluid" />
                </div>
                </div>
                `

                this.dom.container.html(tpl)
                var self = this
                $('#choose-num').on('change', function () {
                    self.store.num = $(this).val()
                    self.store.player = $('#rapoide-name').val() || 'sconosciuto'
                    self.stageQuestion()
                })

            })
        }

        this.addAnswer = function (answer) {
            this.store.answers.push(answer)
        }

        this.stageQuestion = function () {

            if (this.store.answers.length === this.config.questionsNum){
                return this.stageResult()
            }

            var f1 = this.store.num
            var f2 = this.randomIntFromInterval(0, 10)
            while(this.memory.indexOf(f2) !== -1) {
                f2 = this.randomIntFromInterval(0, 10)
            }
            this.memory.push(f2)

            return this.resetContainerDecorator(function () {
                var n = this.store.answers.length + 1
                var tpl = `
                    <div class="row">
                        <div class="col-sm-8">
                            <h2>Domanda numero ${n}, poppante</h2>
                            <p>Quanto fa <strong>${f1} X ${f2}</strong>?</p>
                            <p><input type="number" max="99" maxlength="2" id="response" /></p>
                            <p><input id="submit-response" type="button" class="btn btn-success" value="chiappati sta risposta!" />
                        </div>
                        <div class="col-sm-4">
                            <div class="text-center">
                                <p><i class="fa fa-clock-o fa-4x"></i></p>
                                <div class="timer">
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                `
                this.dom.container.html(tpl)
                var startDate = new Date();
                if (this.interval) {
                    clearInterval(this.interval)
                }
                this.interval = setInterval(function () {
                    var endDate = new Date()
                    var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
                    console.log(seconds)
                    if (seconds != 0) {
                        $('.timer > span').html(seconds + 's')
                    }
                }, 500)
                var self = this
                $('#submit-response').on('click', function () {
                    var endDate = new Date()
                    var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
                    var response = $('#response').val()
                    if (parseInt(response) === f1 * f2) {
                        // ok
                        self.addAnswer({
                            result: true,
                            operation: `${f1} x ${f2} = ${response}`,
                            correction: '',
                            seconds: seconds
                        })
                    } else {
                        // ko
                        var res = f1 * f2
                        self.addAnswer({
                            result: false,
                            operation: `${f1} x ${f2} = ${response}`,
                            correction: `${f1} x ${f2} = ${res}`,
                            seconds: seconds
                        })
                    }
                    self.stageQuestion()
                })
            })
        }

        this.textualResult = function (finalVote) {
            if (finalVote == 10) {
                return this.config.phrases.best[this.randomIntFromInterval(0, this.config.phrases.best.length - 1)]
            } else if (finalVote > 9) {
                return this.config.phrases.veryGood[this.randomIntFromInterval(0, this.config.phrases.veryGood.length - 1)]
            } else if (finalVote > 8) {
                return this.config.phrases.good[this.randomIntFromInterval(0, this.config.phrases.good.length - 1)]
            } else if (finalVote > 7) {
                return this.config.phrases.quiteGood[this.randomIntFromInterval(0, this.config.phrases.quiteGood.length - 1)]
            } else if (finalVote > 6) {
                return this.config.phrases.suff[this.randomIntFromInterval(0, this.config.phrases.suff.length - 1)]
            } else if (finalVote > 5) {
                return this.config.phrases.insuff[this.randomIntFromInterval(0, this.config.phrases.insuff.length - 1)]
            } else if (finalVote > 4) {
                return this.config.phrases.quiteInsuff[this.randomIntFromInterval(0, this.config.phrases.quiteInsuff.length - 1)]
            } else {
                return this.config.phrases.veryInsuff[this.randomIntFromInterval(0, this.config.phrases.veryInsuff.length - 1)]
            }
        }

        this.stageResult = function () {
            clearInterval(this.interval)
            return this.resetContainerDecorator(function () {
                console.info('tabellineiro', 'results')
                var tpl = `
                    <h2>Ecco i risultati, inizia a tremare ahahahahah</h2>
                    <p>Ahahahahahhahaha</p>
                    <p>Grrrrrgrgrgrgrgrggr</p>
                    <p>Pugno in faccia rotante in arrivo!</p>
                `
                $(tpl).appendTo(this.dom.container)
                var vote = 0
                var table = new $('<table />', {'class': 'table table-striped table-bordered'}).appendTo(this.dom.container)
                var th = `<tr><th>N°</th><th>Risposta</th><th>Correzione</th><th>Tempo</th></tr>`
                $(th).appendTo(table)
                var self = this
                var totalSeconds = 0
                this.store.answers.forEach(function (answer, index) {
                    var i = index + 1
                    var responseCss = answer.result ? 'alert-success' : 'alert-danger'
                    var tr = `
                        <tr>
                            <td>${i}</td>
                            <td class="alert ${responseCss}">${answer.operation}</td>
                            <td>${answer.correction}</td>
                            <td>${answer.seconds}</td>
                        </tr>
                    `
                    $(tr).appendTo(table)
                    totalSeconds += answer.seconds
                    if (answer.result) {
                        // 5 is best answer
                        var s = Math.max(self.config.optimalSeconds, answer.seconds)
                        var r = 6 + 4 * (1 / (1 + (s - self.config.optimalSeconds)) * self.config.coeff)
                        vote += r
                    }
                })
                var finalVote = Math.round(10 * vote / this.store.answers.length) / 10
                var textualResult = this.textualResult(finalVote)
                $(`
                    <div class="results">
                        <h3>Amigos,</h3>
                        <p><span class="number-result">${finalVote}</span></p>
                        <p class="textual-result">${textualResult}</p>
                        <p><span class="btn btn-primary" onclick="location.reload()">DI NUOVO</span></p>
                    </div>
                `).appendTo(this.dom.container)
                var storage = localStorage.getItem('tabellineiro')
                storage = JSON.parse(storage)
                if (!storage || !storage.games) {
                    storage = { games: [] }
                }
                storage.games.push({
                    num: this.store.num,
                    player: this.store.player,
                    finalVote: finalVote,
                    totalSeconds: totalSeconds
                })
                console.log(storage, JSON.stringify(storage))
                localStorage.setItem('tabellineiro', JSON.stringify(storage))
            })
        }

        this.init(rootEl)

        return this
    }
})()
