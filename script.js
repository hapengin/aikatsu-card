// =====================================================
// 所持カード
// =====================================================

let ownedCards =
    JSON.parse(
        localStorage.getItem(
            "aikatsu-owned"
        )
    ) || {};


// =====================================================
// 欲しいカード
// =====================================================

let wishCards =
    JSON.parse(
        localStorage.getItem(
            "aikatsu-wish"
        )
    ) || [];


// =====================================================
// 現在のフィルター
// =====================================================

let currentFilter = "all";
let currentSeries = "all";

let currentType = "all";
let currentBrand = "all";
let currentRarity = "all";

// =====================================================
// カードを表示
// =====================================================

function displayCards() {

    const cardList =
        document.getElementById(
            "card-list"
        );

    const searchInput =
        document.getElementById(
            "search-input"
        );

    const searchWord =
        searchInput.value
            .toLowerCase()
            .trim();


    // -------------------------------------------------
    // カードを絞り込み
    // -------------------------------------------------

    const filteredCards =
        cards.filter(card => {

            // 第○弾
          const matchesSeries =
             currentSeries === "all" ||
               card.id.substring(0, 2) === currentSeries;

           if (!matchesSeries) {
                  return false;
            }

            // 検索
            const matchesSearch =
                card.name
                    .toLowerCase()
                    .includes(searchWord)
                ||
                card.id
                    .toLowerCase()
                    .includes(searchWord);


            if (!matchesSearch) {
                return false;
            }

            // タイプ
if (
    currentType !== "all" &&
    card.type !== currentType
) {
    return false;
}


// ブランド
if (
    currentBrand !== "all" &&
    card.brand !== currentBrand
) {
    return false;
}


// レアリティ
if (
    currentRarity !== "all" &&
    card.rarity !== currentRarity
) {
    return false;
}


            // すべて
            if (
                currentFilter ===
                "all"
            ) {
                return true;
            }


            // 所持
            if (
                currentFilter ===
                "owned"
            ) {

                return (
                    (ownedCards[card.id] || 0)
                    > 0
                );

            }


            // 未所持
            if (
                currentFilter ===
                "not-owned"
            ) {

                return (
                    (ownedCards[card.id] || 0)
                    === 0
                );

            }


            // 欲しい
            if (
                currentFilter ===
                "wish"
            ) {

                return wishCards.includes(
                    card.id
                );

            }


            return true;

        });


    // -------------------------------------------------
    // カード一覧を空にする
    // -------------------------------------------------

    cardList.innerHTML = "";


    // -------------------------------------------------
    // 該当カードがない場合
    // -------------------------------------------------

    if (
        filteredCards.length === 0
    ) {

        cardList.innerHTML = `

            <div class="no-card">

                該当するカードがありません💭

            </div>

        `;

        updateStats();

        return;

    }


    // -------------------------------------------------
    // カードを1枚ずつ表示
    // -------------------------------------------------

    filteredCards.forEach(card => {

        const details = cardDetails[card.id] || {};

           card.type = details.type || card.type;
           card.brand = details.brand || card.brand;


        console.log(card);

        const quantity =
            ownedCards[card.id] || 0;


        const isWish =
            wishCards.includes(
                card.id
            );


        const cardElement =
            document.createElement(
                "div"
            );


        cardElement.className =
            "card";


        cardElement.innerHTML = `

            <div class="card-image">

                <img
                    src="${card.image}"
                    alt="${card.name}"
                >

            </div>


            <div class="card-info">


                <div class="card-number">

                    ${card.id}

                </div>


                <div class="card-name">

                    ${card.name}

                </div>


                <div class="card-type">

                     ${card.type}

                </div>

                <div class="card-rarity">

                     ${card.rarity}

                </div>

                <div class="card-brand">

                     ${card.brand}

                </div>


                <div class="card-buttons">


                    <button
                        class="owned-button"
                        onclick="
                            decreaseQuantity('${card.id}')
                        "
                    >

                        −

                    </button>


                    <div class="quantity">

                        ${quantity}枚

                    </div>


                    <button
                        class="owned-button active"
                        onclick="
                            increaseQuantity('${card.id}')
                        "
                    >

                        ＋

                    </button>


                    <button
                        class="
                            wish-button
                            ${isWish ? "active" : ""}
                        "
                        onclick="
                            toggleWish('${card.id}')
                        "
                    >

                        ${isWish
                            ? "⭐"
                            : "☆"
                        }

                    </button>


                </div>


            </div>

        `;


        cardList.appendChild(
            cardElement
        );

    });


    // -------------------------------------------------
    // 統計情報を更新
    // -------------------------------------------------

    updateStats();

}


// =====================================================
// 所持枚数を増やす
// =====================================================

function increaseQuantity(cardId) {

    ownedCards[cardId] =
        (ownedCards[cardId] || 0) + 1;


    saveOwnedCards();


    displayCards();

}


// =====================================================
// 所持枚数を減らす
// =====================================================

function decreaseQuantity(cardId) {

    if (
        !ownedCards[cardId]
    ) {

        return;

    }


    ownedCards[cardId]--;


    // 0枚になったら削除
    if (
        ownedCards[cardId] <= 0
    ) {

        delete ownedCards[cardId];

    }


    saveOwnedCards();


    displayCards();

}


// =====================================================
// 所持カードを保存
// =====================================================

function saveOwnedCards() {

    localStorage.setItem(

        "aikatsu-owned",

        JSON.stringify(
            ownedCards
        )

    );

}


// =====================================================
// 欲しいカードを切り替え
// =====================================================

function toggleWish(cardId) {


    if (
        wishCards.includes(
            cardId
        )
    ) {


        wishCards =
            wishCards.filter(
                id =>
                    id !== cardId
            );


    } else {


        wishCards.push(
            cardId
        );

    }


    // 保存
    localStorage.setItem(

        "aikatsu-wish",

        JSON.stringify(
            wishCards
        )

    );


    displayCards();

}


// =====================================================
// 統計情報を更新
// =====================================================

function updateStats() {


    // 全カード種類
    const total =
        cards.length;


    // 1枚以上持っているカード種類
    const owned =
        Object.keys(
            ownedCards
        ).filter(
            id =>
                ownedCards[id] > 0
        ).length;


    // コンプリート率
    let rate = 0;


    if (
        total > 0
    ) {

        rate =
            Math.round(
                (owned / total)
                * 100
            );

    }


    // 画面に表示

    document.getElementById(
        "owned-count"
    ).textContent =
        owned;


    document.getElementById(
        "total-count"
    ).textContent =
        total;


    document.getElementById(
        "collection-rate"
    ).textContent =
        rate;

}


// =====================================================
// 検索
// =====================================================

document
    .getElementById(
        "search-input"
    )
    .addEventListener(
        "input",
        displayCards
    );


// =====================================================
// フィルターボタン
// =====================================================

document
    .querySelectorAll(
        ".filter-button"
    )
    .forEach(button => {


        button.addEventListener(
            "click",
            () => {


                // フィルター変更
                currentFilter =
                    button.dataset.filter;


                // 全ボタンのactiveを外す
                document
                    .querySelectorAll(
                        ".filter-button"
                    )
                    .forEach(
                        b =>
                            b.classList
                                .remove(
                                    "active"
                                )
                    );


                // 押したボタンをactive
                button.classList.add(
                    "active"
                );


                // 再表示
                displayCards();

            }
        );

    });

// =====================================================
// 弾数ボタンを自動生成
// =====================================================

// =====================================================
// 弾数ボタンを自動生成
// =====================================================

function createSeriesButtons() {

    const seriesButtons =
        document.getElementById("series-buttons");

    // カードIDから弾数を取得
    const seriesList = [
        ...new Set(
            cards.map(card =>
                card.id.substring(0, 2)
            )
        )
    ];

    // ボタンを作成
    seriesButtons.innerHTML = "";

    // すべて
    const allButton =
        document.createElement("button");

    allButton.className =
        "series-button active";

    allButton.textContent = "すべて";

    allButton.dataset.series = "all";

    seriesButtons.appendChild(allButton);


    // 第1弾、第2弾、第3弾……
    seriesList
        .sort()
        .forEach(series => {

            const button =
                document.createElement("button");

            button.className =
                "series-button";

            button.textContent =
                `第${parseInt(series)}弾`;

            button.dataset.series =
                series;


            // クリック
            button.addEventListener(
                "click",
                function () {

                    currentSeries =
                        this.dataset.series;

                    // 全ボタンのactiveを外す
                    seriesButtons
                        .querySelectorAll(
                            ".series-button"
                        )
                        .forEach(b => {

                            b.classList.remove(
                                "active"
                            );

                        });


                    // 押したボタンをactive
                    this.classList.add(
                        "active"
                    );


                    // カードを再表示
                    displayCards();

                }
            );


            seriesButtons.appendChild(button);

        });


    // 「すべて」ボタンのクリック
    allButton.addEventListener(
        "click",
        function () {

            currentSeries = "all";

            seriesButtons
                .querySelectorAll(
                    ".series-button"
                )
                .forEach(b => {

                    b.classList.remove(
                        "active"
                    );

                });

            this.classList.add("active");

            displayCards();

        }
    );

}

// =====================================================
// タイプ・ブランド・レアリティのボタンを作成
// =====================================================

function createDetailFilterButtons() {

    // -------------------------------------------------
    // タイプ
    // -------------------------------------------------

    const typeButtons =
        document.getElementById(
            "type-buttons"
        );

    typeButtons.innerHTML = "";

    const allTypeButton =
        document.createElement("button");

    allTypeButton.className =
        "detail-filter-button active";

    allTypeButton.textContent =
        "すべて";

    typeButtons.appendChild(
        allTypeButton
    );


    cardTypes.forEach(type => {

        const button =
            document.createElement("button");

        button.className =
            "detail-filter-button";

        button.textContent =
            type;

        button.addEventListener(
            "click",
            function () {

                currentType = type;

                typeButtons
                    .querySelectorAll(
                        ".detail-filter-button"
                    )
                    .forEach(b => {

                        b.classList.remove(
                            "active"
                        );

                    });

                this.classList.add(
                    "active"
                );

                displayCards();

            }
        );

        typeButtons.appendChild(
            button
        );

    });


    allTypeButton.addEventListener(
        "click",
        function () {

            currentType = "all";

            typeButtons
                .querySelectorAll(
                    ".detail-filter-button"
                )
                .forEach(b => {

                    b.classList.remove(
                        "active"
                    );

                });

            this.classList.add(
                "active"
            );

            displayCards();

        }
    );


    // -------------------------------------------------
    // ブランド
    // -------------------------------------------------

    const brandButtons =
        document.getElementById(
            "brand-buttons"
        );

    brandButtons.innerHTML = "";

    const allBrandButton =
        document.createElement("button");

    allBrandButton.className =
        "detail-filter-button active";

    allBrandButton.textContent =
        "すべて";

    brandButtons.appendChild(
        allBrandButton
    );


    brands.forEach(brand => {

        const button =
            document.createElement("button");

        button.className =
            "detail-filter-button";

        button.textContent =
            brand;

        button.addEventListener(
            "click",
            function () {

                currentBrand = brand;

                brandButtons
                    .querySelectorAll(
                        ".detail-filter-button"
                    )
                    .forEach(b => {

                        b.classList.remove(
                            "active"
                        );

                    });

                this.classList.add(
                    "active"
                );

                displayCards();

            }
        );

        brandButtons.appendChild(
            button
        );

    });


    allBrandButton.addEventListener(
        "click",
        function () {

            currentBrand = "all";

            brandButtons
                .querySelectorAll(
                    ".detail-filter-button"
                )
                .forEach(b => {

                    b.classList.remove(
                        "active"
                    );

                });

            this.classList.add(
                "active"
            );

            displayCards();

        }
    );


    // -------------------------------------------------
    // レアリティ
    // -------------------------------------------------

    const rarityButtons =
        document.getElementById(
            "rarity-buttons"
        );

    rarityButtons.innerHTML = "";

    const allRarityButton =
        document.createElement("button");

    allRarityButton.className =
        "detail-filter-button active";

    allRarityButton.textContent =
        "すべて";

    rarityButtons.appendChild(
        allRarityButton
    );


    rarities.forEach(rarity => {

        const button =
            document.createElement("button");

        button.className =
            "detail-filter-button";

        button.textContent =
            rarity;

        button.addEventListener(
            "click",
            function () {

                currentRarity = rarity;

                rarityButtons
                    .querySelectorAll(
                        ".detail-filter-button"
                    )
                    .forEach(b => {

                        b.classList.remove(
                            "active"
                        );

                    });

                this.classList.add(
                    "active"
                );

                displayCards();

            }
        );

        rarityButtons.appendChild(
            button
        );

    });


    allRarityButton.addEventListener(
        "click",
        function () {

            currentRarity = "all";

            rarityButtons
                .querySelectorAll(
                    ".detail-filter-button"
                )
                .forEach(b => {

                    b.classList.remove(
                        "active"
                    );

                });

            this.classList.add(
                "active"
            );

            displayCards();

        }
    );

}

// =====================================================
// 最初にカードを表示
// =====================================================

createSeriesButtons();
createDetailFilterButtons();
displayCards();