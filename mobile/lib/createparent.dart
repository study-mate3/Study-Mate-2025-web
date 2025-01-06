import 'package:flutter/material.dart';
import 'package:mobile/createparent2.dart';
import 'package:mobile/login.dart';

class Createparent extends StatefulWidget {
  const Createparent({super.key});

  @override
  State<Createparent> createState() => _CreateparentState();
}

class _CreateparentState extends State<Createparent> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 106),
            children: [
              Container(
                child: Image.asset(
                  'assets/img/logo2.png',
                  height: 42,
                  width: 148,
                ),
              ),
              const SizedBox(height: 60),
              Container(
                child: const Text(
                  'Create Your Account',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 40),
              Container(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'User Name',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                        height: 8), // Spacing between label and input
                    TextField(
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(15),
                        ), // Add a border around the input
                        hintText: 'Enter Your User Name', // Placeholder text
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 40),
              Container(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Email",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                        height: 8), // Spacing between label and input
                    TextField(
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(15),
                        ), // Add a border around the input
                        hintText:
                            "Enter Your Email Address", // Placeholder text
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              Container(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Password",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(
                        height: 8), // Spacing between label and input
                    TextField(
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(15),
                        ), // Add a border around the input
                        hintText: "Enter Your Password", // Placeholder text
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 50),
              Center(
                  child: SizedBox(
                width: 250,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const Createparent2()));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0570B2),
                    padding: const EdgeInsets.all(5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: const Text('Next',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.bold)),
                ),
              ))
            ]),
      ),
    );
  }
}
