import 'package:flutter/material.dart';
import 'package:mobile/createparent.dart';
import 'package:mobile/createstudent.dart';

class Roleselection extends StatefulWidget {
  const Roleselection({super.key});

  @override
  State<Roleselection> createState() => _RoleselectionState();
}

class _RoleselectionState extends State<Roleselection> {
  String? _selectedRole;
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
                'Which account fits you best? \nChoose your role',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 60),
            Container(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Column(
                    children: [
                      Container(
                        child: ElevatedButton(
                            onPressed: () {
                              setState(() {
                                _selectedRole = 'Parent';
                              });
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _selectedRole == 'Parent'
                                  ? Colors.blue
                                  : Colors.blue[100],
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding: const EdgeInsets.all(10),
                            ),
                            child: Column(
                              children: [
                                Container(
                                  child: Image.asset(
                                    'assets/img/test.png',
                                    height: 144,
                                    width: 128,
                                  ),
                                ),
                                const SizedBox(height: 5),
                                Container(
                                  child: const Text(
                                    'Parent',
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                )
                              ],
                            )),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Container(
                        child: ElevatedButton(
                            onPressed: () {
                              setState(() {
                                _selectedRole = 'Student';
                              });
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _selectedRole == 'Student'
                                  ? Colors.blue
                                  : Colors.blue[100],
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding: const EdgeInsets.all(10),
                            ),
                            child: Column(
                              children: [
                                Container(
                                  child: Image.asset(
                                    'assets/img/stu.png',
                                    height: 144,
                                    width: 128,
                                  ),
                                ),
                                const SizedBox(height: 5),
                                Container(
                                  child: const Text(
                                    'Student',
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                )
                              ],
                            )),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 60),
            Container(
              child: ElevatedButton(
                onPressed: () {
                  if (_selectedRole == 'Parent') {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const Createparent()),
                    );
                  } else if (_selectedRole == 'Student') {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const Createstudent()),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0570B2),
                  padding: const EdgeInsets.all(5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                child: const Text('Continue',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
