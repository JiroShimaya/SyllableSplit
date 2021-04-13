//日本語のカナの正規表現パターンをア段からオ段の音（と全部）に分けて取得
//日本語の場合、「ファ」などのように２文字で１モーラを構成するカナがあることに注意
function getKanaPattern(){
  //ア段からオ段までの1文字カナ集合と「テ」「デ」の集合を定義
  let kana_a = "[アカサタナハマヤラワガザダバパ]";
  let kana_i = "[イキシチニヒミリギジヂビピ]";
  let kana_i2 = kana_i.replace("イ","");//ャュョとくっつける用のイ段
  let kana_u = "[ウクスツヌフムユルグズヅブプヴ]";
  let kana_e = "[エケセテネヘメレゲゼデベペ]";
  let kana_o = "[オコソトノホモヨロヲゴゾドボポ]";
  let kana_td = "[テデ]";

  //２文字で１モーラになるカナの定義
  let kana_multi_a = "("+[kana_u+"[ァヮ]",kana_i+"ャ",kana_td+"ャ"].join("|")+")";
  let kana_multi_i = "("+[kana_u+"ィ",kana_td+"ィ"].join("|")+")";
  let kana_multi_u = "("+[kana_i+"ュ",kana_td+"ュ","[トド]ゥ"].join("|")+")";
  let kana_multi_e = "("+[kana_u+"ェ",kana_i+"ェ"].join("|")+")";
  let kana_multi_o = "("+[kana_u+"ォ",kana_i+"ョ"].join("|")+")";
  let kana_multi = "("+[kana_u+"[ァィェォ]",kana_td+"[ャィュョ]",kana_i+"[ャュョ]"].join("|")+")";
  
  //ンーッと小文字を除くカナ
  let kana_single_base = "[アイウエオ-ヂツ-モヤユヨ-ロワヲヴ]";
  //２文字で１モーラとなるカナも含めた全カナ集合(ー/ン/ッと小文字単体は除く)の定義
  let kana_base = "("+[kana_multi, kana_single_base].join("|")+")";
  //２文字で１モーラとなるカナも含めた全カナ集合(ー/ン/ッと小文字単体も含む)の定義
  let kana_all = "("+[kana_multi, "[ァ-ヴー]"].join("|")+")";
  
  return {
    "base":kana_base,
    "all":kana_all,
    "multi_a":kana_multi_a,
    "multi_i":kana_multi_i,
    "multi_u":kana_multi_u,
    "multi_e":kana_multi_e,
    "multi_o":kana_multi_o,
    "multi":kana_multi,
    "single_a":kana_a,
    "single_i":kana_i,
    "single_u":kana_u,
    "single_e":kana_e,
    "single_o":kana_o,
    "single_td":kana_td,
    "single_base":kana_single_base
  }
}
//文字を母音に変換
function charToVowel(char){
	if(char == "ー" ){
		//console.log("warning: only ー is input");
		return char;
	}

	//伸ばし棒を除いた末尾の文字を取得
	let last = char[char.length-1];
	for(let i=char.length-1;i>-1;i--){
		last = char[i];
		if(last != "ー")break;
	}
	
	let rows = {
			"ア":"アカサタナハマヤラワガザダバパァャヮ",
			"イ":"イキシチニヒミリギジヂビピィ",
			"ウ":"ウクスツヌフムユルグズヅブプヴゥュ",
			"エ":"エケセテネヘメレゲゼデベペェ",
			"オ":"オコソトノホモヨロゴゾドボポォ",
			"sp":["sp","ン","ッ"]
	}
	let vowel = last;
	for(let v in rows){
		let row = rows[v];
		if(row.includes(last)){
			vowel = v;
			break;
		}
	}
	return vowel;
}

//小文字母音を長音に変換
function smallVowelToBar(text){
	//長音のうしろの小文字母音を長音に
	let replaced_text = text.replace(/(?<=ー)(ァ+|ィ+|ゥ+|ェ+|ォ+)/g,"");
	
	//同じ母音のカナの後ろの小文字母音を長音に
	replaced_text = replaced_text.replace(/[ァ-ヴ](ァ+|ィ+|ゥ+|ェ+|ォ+)/g,function(match){
		let res = match;
		let l2s = { "ア":"ァ", "イ":"ィ", "ウ":"ゥ", "エ":"ェ", "オ":"ォ" }
		//1文字目の母音が2文字目の小文字母音と対応していたら
		let first_vowel = charToVowel(match[0]);
		if(first_vowel in l2s && l2s[first_vowel] == match[1]){
			res = match[0]+"ー";
		}
		//エィやオゥも長音に変換したい場合はコメントを外す
		//else if(first_vowel == "エ" && match[1] == "ィ"){
		//	res = match[0] + "ー";
		//}else if(first_vowel == "オ" && match[1] == "ゥ"){
		//	res = match[0] + "ー";
		//}
		//上記以外の小文字母音の連続に対応(これがないと「ヴァァァ」の「ァァァ」などが残り続ける
		else if(match.length>=3){
			res = match[0]+match[1]+"ー";
		}
		return res;
	});	
	return replaced_text;
}


//2文字カナの一部でない小文字(ッを除く)を大文字にする
function smallVowelToLarge(text){
	
	let re_a = "(?<![ウクスツヌフムユルグズヅブプヴ])[ァヮェォ]";//ウ段の後ろ以外のァヮェォ
	let re_u = "(?<![トド])ゥ";
	let re_y = "(?<![キシチニヒミリギジヂビピテデ])[ャュョ]";//イ段の後ろ以外のャュョ
	let re_i = "(?<![ウクスツヌフムユルグズヅブプヴテデ])[ィ]";//テデの後ろ以外のィ
	let re = [re_a,re_y,re_u,re_i].join("|");//上記のいずれかにマッチさせる
	
	let s2l = {"ァ":"ア","ィ":"イ","ゥ":"ウ","ェ":"エ","ォ":"オ","ヮ":"ワ","ャ":"ヤ","ュ":"ユ","ョ":"ヨ"}
	//マッチした小文字を大文字にして返す
	let replaced_text = text.replace(new RegExp(re,"g"),function(match){
		let large = s2l[match];
		return large;
	});
	return replaced_text;
}
//ーとッの不自然な並びを削除する
function removeBarAndSokuonReputation(text){
	text = text.replace(/ー+/g,"ー");//ーの連続を1文字にする
	text = text.replace(/(?<=ッ)[ーッ]+/g,"");//ッの後ろのーまたはッの連続を削除
	text = text.replace(/^[ーッ]+/g,"")//先頭の[ーッ]を削除
	return text;
}
//小文字や長音、促音の不自然な並びを解消する
function formatText(text){
	text = smallVowelToBar(text);
	text = smallVowelToLarge(text);
	text = removeBarAndSokuonReputation(text);
	return text;
}


//入力カナをモウラの単位で分かち書きする。
function moraSplit(text){
  let kana = getKanaPattern();
  let re = /[ウクスツヌフムユルグズヅブプ][ァヮィェォ]|[キシチニヒミリギジヂビピテデ][ャュェョ]|[テデ]ィ|[ァ-ヴー]/g;
  //let re = kana["base"];//kana["base"]にはン/ッ/ーや単独の小文字が含まれていないことに注意
  //re += "|"+kana["rest"]; //結果を見やすくするため、kana_baseに含まれないカナを追加する
  text = text.match(re);
  return text;
}

function syllableSplit(text){
	//よく使うカナパターンの取得
	let kana = getKanaPattern();
	//ーンッを前のカナとつなげるときのパターン
	let re2 = "ーッ|ンッ|ーン(?![ーッ])";//ーンは後ろにーッが来るとき以外
	let re1 = "ー|ッ|ン(?!ー)";//ンは後ろに長音が来るとき以外
	let re_back = "("+[re2,re1].join("|")+")";

	//長いものからマッチする
	//２文字カナとーンッのマッチ
	let re_multi_bar = "("+kana["multi"] + re_back + ")";

	//2文字カナと母音のマッチ
	let re_multi_a = kana["multi_a"]+"ア";
	let re_multi_i = kana["multi_i"]+"イ";
	let re_multi_u = kana["multi_u"]+"ウ";
	let re_multi_e = kana["multi_e"]+"[エイ]";
	let re_multi_o = kana["multi_o"]+"(オ|ウ(?![ァィゥェォ]))";
	let re_multi_vowel = "("+[re_multi_a,re_multi_i,re_multi_u,re_multi_e,re_multi_o].join("|")+")";
	re_multi_vowel += "(?![ーンッ])";
	
	//２文字カナ単独のマッチ
	let re_multi_unit = kana["multi"];
	
	//ンとーッのマッチ
	let re_n_bar = "ン([ーッ]|ーッ)";
	
	//１文字カナとーッンのマッチ
	let re_single_bar = "("+kana["single_base"]+re_back+")";

	//１文字カナと母音のマッチ
	let re_single_a = kana["single_a"]+"ア";
	let re_single_i = kana["single_i"]+"イ";
	let re_single_u = kana["single_u"]+"ウ(?![ァィェォ])";
	let re_single_e = kana["single_e"]+"[エイ]";
	let re_single_o = kana["single_o"]+"(オ|ウ(?![ァィェォ]))";
	let re_single_vowel = "("+[re_single_a,re_single_i,re_single_u,re_single_e,re_single_o].join("|")+")";
	//1文字カナ単独のマッチ
	re_single_vowel += "(?![ーンッ])";

	let re_single_unit = "[ァ-ヴー]";
	//上記で定義した条件のオアをとる
	let re = [re_multi_bar, re_multi_vowel, re_multi_unit, re_n_bar, re_single_bar, re_single_vowel, re_single_unit].join("|");
	
	//matchで抽出
	text = text.match(new RegExp(re,"g"));

	return text;
}




function getRandomText(kana, length = 10){
	let text = "";
	for(let i=0;i<length;i++){
		let rand = Math.floor(Math.random()*kana.length);//randomなindexを取得
		text += kana[rand];
	}
	return text;
}

(function(){
	let texts = [
		"アウトバーン",
		"ーーッアッッウートンッバァァァーーンンッ",
		"コウチョウセンセイ",
		"ガッキュウシンブンノエイセイテキカンテン",
		"オウトクチュウル",
		"チューンナップ",
		"ピュビュッパラッパンッパーンェィ",
		"イェェェェーーーーィイッ"
	]
	for(let text of texts){
		let formatted = formatText(text);
		let splitted = syllableSplit(formatted);
		console.log("raw",text);
		console.log("formatted",formatted);
		console.log("splitted",splitted);
		console.log("formatted==splitted", formatted == splitted.join(""));
	}
})();

