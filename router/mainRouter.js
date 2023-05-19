const express = require('express')
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../model/db');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.get("/", function(req,res){
    db.query('SELECT * FROM movie', function(error, results) {
        res.render('movie',{data:results, check:false})
    })
})

router.post("/", function(req,res){
    var id = req.body.id
    var name = req.body.name
    var phone = req.body.phone
    var password = req.body.password
    var people = req.body.people
    if(id&&name&&phone&&password&&people){
        db.query('SELECT * FROM movie WHERE id = ?',[id], function(error, result1){
            console.log(result1)
            var movie = result1[0]
            var title = movie.title
            var place = movie.place
            var time = movie.time
            var price = movie.price
            var capable = movie.capable
            var totalPrice = people * price
    
            if(movie.capable<people){
                res.send(`<script type="text/javascript">alert("잔여 좌석이 부족합니다.");
                history.back();</script>`)
            }else{
                console.log("ㅎ")
                capable = capable - people
                db.query('UPDATE movie SET capable = ? WHERE id = ?', [capable, id], function(error, result2){})
                db.query('INSERT INTO customer(name, phone, password, title, place, time, people, price) value(?,?,?,?,?,?,?,?)', 
                [name, phone, password, title, place, time, people, totalPrice],function(error, result2) {
                    res.send(`<script type="text/javascript">alert("예매되었습니다!");
                    document.location.href="/";</script>`);
                })
            }
        })
    }else{
        res.send(`<script type="text/javascript">alert("정보를 모두 입력해 주세요.");
        history.back();</script>` )
    }
})

router.post("/check", function(req,res){
    var name = req.body.name
    var phone = req.body.phone
    var password = req.body.password
    console.log(name, phone, password)
    if(name&&phone&&password){
        console.log("ㅎ")
        db.query('SELECT * FROM customer WHERE name = ? AND phone = ? AND password = ?', [name, phone, password], function(error, result1){
            if(result1.length>0){
                db.query('SELECT * FROM movie', function(error, result2) {
                    res.render('movie',{data:result2, check:result1})
                })
            }else{
                res.send(`<script type="text/javascript">alert("일치하는 정보가 없습니다.");
                history.back();</script>` )
            }
        })
    }
    else{
        res.send(`<script type="text/javascript">alert("정보를 모두 입력해 주세요.");
        history.back();</script>`);
    }
})


module.exports = router