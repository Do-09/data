const express = require('express')
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../model/db');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.get("/", function(req,res){ //메인화면
    db.query('SELECT * FROM movie', function(error, results) {
        res.render('movie',{data:results, check:false})
    })
})

router.post("/", function(req,res){ //예약하기
    var id = req.body.id
    var name = req.body.name
    var phone = req.body.phone
    var password = req.body.password
    var people = req.body.people
    if(id&&name&&phone&&password&&people){ // 정보가 다 입력되었을 경우
        db.query('SELECT * FROM movie WHERE movieID = ?',[id], function(error, result1){
            var movie = result1[0]
            var price = movie.price
            var capable = movie.capable
            var totalPrice = people * price
            if(movie.capable<people){ // 사람 수가 해당 영화의 잔여좌석보다 많을 경우(잔여좌석 부족)
                res.send(`<script type="text/javascript">alert("잔여 좌석이 부족합니다.");
                history.back();</script>`)
            }else{
                capable = capable - people // 잔여좌석 - 사람 수
                db.query('UPDATE movie SET capable = ? WHERE movieID = ?', [capable, id], function(error, result2){}) // movie 테이블 잔여좌석 수 변경
                db.query('INSERT INTO customer(name, phone, password, movieID, people, totalPrice) value(?,?,?,?,?,?)', // customer 테이블에 예매자 정보 입력
                [name, phone, password, id, people, totalPrice],function(error, result2) {
                    res.send(`<script type="text/javascript">alert("예매되었습니다!");
                    document.location.href="/";</script>`);
                })
            }
        })
    }else{ // 정보가 다 입력되지 않았을 경우
        res.send(`<script type="text/javascript">alert("정보를 모두 입력해 주세요.");
        history.back();</script>` )
    }
})

router.post("/check", function(req,res){ // 예약 내역 확인하기
    var name = req.body.name
    var phone = req.body.phone
    var password = req.body.password
    if(name&&phone&&password){ // 정보가 다 입력되었을 경우
        db.query('SELECT a.*, b.* FROM customer a LEFT JOIN movie b ON a.movieID = b.movieID WHERE name = ? AND phone = ? AND password = ?', 
        [name, phone, password], function(error, result1){ 
            if(result1.length>0){ // customer 테이블에 일치하는 정보가 있을 경우
                db.query('SELECT * FROM movie', function(error, result2) {
                    res.render('movie',{data:result2, check:result1})
                })
            }else{ // 일치하는 정보가 없을 경우
                res.send(`<script type="text/javascript">alert("일치하는 정보가 없습니다.");
                history.back();</script>` )
            }
        })
    }
    else{ // 정보가 다 입력되지 않았을 경우
        res.send(`<script type="text/javascript">alert("정보를 모두 입력해 주세요.");
        history.back();</script>`);
    }
})


router.post("/cancel", function(req,res){ // 예약 취소
    var id = req.body.id // 고객 id 
    if(id){
        if(Array.isArray(id)){ // 선택된 체크박스가 2개 이상일 경우(취소할 영화가 2개 이상)
            for(var i = 0; i<id.length; i++){
                db.query('SELECT a.*, b.* FROM customer a LEFT JOIN movie b ON a.movieID = b.movieID WHERE id = ?',[id[i]], function(error, result){
                    var cancel = result[0]
                    var id = cancel.id
                    var capable = cancel.capable + cancel.people
                    var movieID = cancel.movieID
                    db.query('UPDATE movie SET capable = ? WHERE movieID = ?', [capable, movieID], function(error, result){}) // 취소한 사람 수만큼 잔여 좌석 변경
                    db.query('DELETE FROM customer WHERE id = ?',[id], function(error, result){}) // 예약 정보 삭제
                })
            }
        } else{ // 선택된 체크박스가 1개일 경우(취소할 영화가 1개)
            db.query('SELECT a.*, b.* FROM customer a LEFT JOIN movie b ON a.movieID = b.movieID WHERE id = ?',[id], function(error, result){
                var cancel = result[0]
                var id = cancel.id
                var capable = cancel.capable + cancel.people
                var movieID = cancel.movieID
                db.query('UPDATE movie SET capable = ? WHERE movieID = ?', [capable, movieID], function(error, result){})
                db.query('DELETE FROM customer WHERE id = ?',[id], function(error, result){})
            })
        }
        res.send(`<script type="text/javascript">alert("예약이 취소되었습니다.");
        document.location.href="/";</script>`);
    } else{ // 체크박스 선택 안하고 취소 버튼 눌렀을 경우(선택된 영화X)
        res.send(`<script type="text/javascript">alert("영화를 선택해 주세요.");
        history.back();</script>`);
    }
})


module.exports = router