import paypal from "paypal-rest-sdk";
import dotenv from "dotenv";
dotenv.config();

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PAYPAL_CLIENT_KEY,
  client_secret: process.env.PAYPAL_SECRET_KEY,
});

// const renderBuyPage = async(req,res)=>{

//     try {

//         res.render('index');

//     } catch (error) {
//         console.log(error.message);
//     }

// }

let proprice = 0;

export const payProduct = async (req, res) => {
  const { name, price } = req.body;
  proprice = (price/84.80).toFixed(2);
  try {
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "https://edumarketbe.onrender.com/api-v1/payment/success",
        cancel_url: "https://edumarketbe.onrender.com/api-v1/payment/cancel",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: name,
                sku: "001",
                price: proprice,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: proprice,
          },
          description: "This is payment description.",
        },
      ],
    };

    await paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for(let i=0; i<payment?.links?.length; i++){
          if(payment?.links[i]?.rel === 'approval_url'){
            res.send(payment?.links[i]?.href);
          }
        }
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const successPage = async (req, res) => {
  try {
    console.log("Request Data:", req);
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: proprice,
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          const response = JSON.stringify(payment);
          const ParsedResponse = JSON.parse(response);
          // console.log(ParsedResponse);
          // alert("Success");
          return res.redirect('https://edumarket.onrender.com/success');
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

export const cancelPage = async (req, res) => {
  try {
    alert("Cancel");
  } catch (error) {
    console.log(error.message);
  }
};

// module.exports = {
//     renderBuyPage,
//     payProduct,
//     successPage,
//     cancelPage
// }
